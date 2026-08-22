"use client";
import { SectionTitle } from "@/components";
import { useProductStore } from "../_zustand/store";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { formatDZD } from "@/lib/currency";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import { getVariantPrice } from "@/lib/product-variants";

const algerianWilayas = [
  ["01", "Adrar"], ["02", "Chlef"], ["03", "Laghouat"], ["04", "Oum El Bouaghi"],
  ["05", "Batna"], ["06", "Bejaia"], ["07", "Biskra"], ["08", "Bechar"],
  ["09", "Blida"], ["10", "Bouira"], ["11", "Tamanrasset"], ["12", "Tebessa"],
  ["13", "Tlemcen"], ["14", "Tiaret"], ["15", "Tizi Ouzou"], ["16", "Alger"],
  ["17", "Djelfa"], ["18", "Jijel"], ["19", "Setif"], ["20", "Saida"],
  ["21", "Skikda"], ["22", "Sidi Bel Abbes"], ["23", "Annaba"], ["24", "Guelma"],
  ["25", "Constantine"], ["26", "Medea"], ["27", "Mostaganem"], ["28", "M'Sila"],
  ["29", "Mascara"], ["30", "Ouargla"], ["31", "Oran"], ["32", "El Bayadh"],
  ["33", "Illizi"], ["34", "Bordj Bou Arreridj"], ["35", "Boumerdes"], ["36", "El Tarf"],
  ["37", "Tindouf"], ["38", "Tissemsilt"], ["39", "El Oued"], ["40", "Khenchela"],
  ["41", "Souk Ahras"], ["42", "Tipaza"], ["43", "Mila"], ["44", "Ain Defla"],
  ["45", "Naama"], ["46", "Ain Temouchent"], ["47", "Ghardaia"], ["48", "Relizane"],
  ["49", "Timimoun"], ["50", "Bordj Badji Mokhtar"], ["51", "Ouled Djellal"], ["52", "Beni Abbes"],
  ["53", "In Salah"], ["54", "In Guezzam"], ["55", "Touggourt"], ["56", "Djanet"],
  ["57", "El M'Ghair"], ["58", "El Meniaa"],
] as const;

const getWilayaName = (code: string) => algerianWilayas.find(([wilayaCode]) => wilayaCode === code)?.[1] || code;

const CheckoutPage = () => {
  const { data: session } = useSession();
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    lastname: "",
    phone: "",
    email: "",
    adress: "",
    apartment: "",
    wilaya: "16",
    orderNotice: "",
    paymentMethod: "cash_on_delivery",
    paymentProvider: "",
    cardNumber: "",
    cardCode: "",
    expirationDate: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentAccounts, setPaymentAccounts] = useState({ ccpAccount: "", bankAccount: "" });
  const [couponCode, setCouponCode] = useState("");
  const { products, total, clearCart, updateCartVariant } = useProductStore();
  const router = useRouter();
  const normalizedCoupon = couponCode.trim().toUpperCase();
  const couponProducts = products.filter((product) => product.couponCode?.toUpperCase() === normalizedCoupon && (product.couponPercent ?? 0) > 0);
  const discount = couponProducts.reduce((amount, product) => amount + product.price * product.amount * ((product.couponPercent ?? 0) / 100), 0);
  const discountedSubtotal = Math.max(0, total - discount);
  const orderTotal = discountedSubtotal === 0 ? 0 : Math.round(discountedSubtotal + discountedSubtotal / 5 + 5);

  // Add validation functions that match server requirements
  const validateForm = () => {
    const errors: string[] = [];
    
    // Name validation
    if (!checkoutForm.name.trim() || checkoutForm.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }
    
    // Lastname validation
    if (!checkoutForm.lastname.trim() || checkoutForm.lastname.trim().length < 2) {
      errors.push("Lastname must be at least 2 characters");
    }
    
    // Email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!checkoutForm.email.trim() || !emailRegex.test(checkoutForm.email.trim())) {
      errors.push("Please enter a valid email address");
    }
    
    // Phone validation (must be at least 10 digits)
    const phoneDigits = checkoutForm.phone.replace(/[^0-9]/g, '');
    if (!checkoutForm.phone.trim() || phoneDigits.length < 10) {
      errors.push("Phone number must be at least 10 digits");
    }
    
    // Address validation
    if (!checkoutForm.adress.trim() || checkoutForm.adress.trim().length < 5) {
      errors.push("Address must be at least 5 characters");
    }
    
    // Apartment validation (updated to 1 character minimum)
    if (!checkoutForm.apartment.trim() || checkoutForm.apartment.trim().length < 1) {
      errors.push("Apartment is required");
    }
    
    return errors;
  };

  const makePurchase = async () => {
    // Client-side validation first
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast.error(error);
      });
      return;
    }

    // Basic client-side checks for required fields (UX only)
    const requiredFields = [
      'name', 'lastname', 'phone', 'email', 'adress', 'apartment', 'wilaya'
    ];
    
    const missingFields = requiredFields.filter(field => 
      !checkoutForm[field as keyof typeof checkoutForm]?.trim()
    );

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (products.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (total <= 0) {
      toast.error("Invalid order total");
      return;
    }

    if (checkoutForm.paymentMethod === "online") {
      if (!checkoutForm.paymentProvider) {
        toast.error("Please choose CCP or Bank transfer");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      console.log("🚀 Starting order creation...");
      
      // Get user ID if logged in
      let userId = null;
      if (session?.user?.email) {
        try {
          console.log("🔍 Getting user ID for logged-in user:", session.user.email);
          const userResponse = await apiClient.get(`/api/users/email/${session.user.email}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            userId = userData.id;
            console.log("✅ Found user ID:", userId);
          } else {
            console.log("❌ Could not find user with email:", session.user.email);
          }
        } catch (userError) {
          console.log("⚠️  Error getting user ID:", userError);
        }
      }
      
      // Prepare the order data
      const orderData = {
        name: checkoutForm.name.trim(),
        lastname: checkoutForm.lastname.trim(),
        phone: checkoutForm.phone.trim(),
        email: checkoutForm.email.trim().toLowerCase(),
        company: "Algerian customer",
        adress: checkoutForm.adress.trim(),
        apartment: checkoutForm.apartment.trim(),
        postalCode: `DZ-${checkoutForm.wilaya}`,
        status: "pending",
        total: orderTotal,
        city: getWilayaName(checkoutForm.wilaya),
        country: "Algeria",
        orderNotice: checkoutForm.orderNotice.trim(),
        paymentMethod: checkoutForm.paymentMethod,
        paymentProvider: checkoutForm.paymentProvider,
        cardLastFour: null,
        userId: userId // Add user ID for notifications
      };

      console.log("📋 Order data being sent:", orderData);

      // Send order data to server for validation and processing
      const response = await apiClient.post("/api/orders", orderData);

      console.log("📡 API Response received:");
      console.log("  Status:", response.status);
      console.log("  Status Text:", response.statusText);
      console.log("  Response OK:", response.ok);
      
      // Check if response is ok before parsing
      if (!response.ok) {
        console.error("❌ Response not OK:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        
        // Try to parse as JSON to get detailed error info
        try {
          const errorData = JSON.parse(errorText);
          console.error("Parsed error data:", errorData);
          
          // Handle different error types
          if (response.status === 409) {
            // Duplicate order error
            toast.error(errorData.details || errorData.error || "Duplicate order detected");
            return; // Don't throw, just return to stop execution
          } else if (errorData.details && Array.isArray(errorData.details)) {
            // Validation errors
            errorData.details.forEach((detail: any) => {
              toast.error(`${detail.field}: ${detail.message}`);
            });
          } else if (typeof errorData.details === 'string') {
            // Single error message in details
            toast.error(errorData.details);
          } else {
            // Fallback error message
            toast.error(errorData.error || "Order creation failed");
          }
        } catch (parseError) {
          console.error("Could not parse error as JSON:", parseError);
          toast.error("Order creation failed. Please try again.");
        }
        
        return; // Stop execution instead of throwing
      }

      const data = await response.json();
      console.log("✅ Parsed response data:", data);
      
      const orderId: string = data.id;
      console.log("🆔 Extracted order ID:", orderId);

      if (!orderId) {
        console.error("❌ Order ID is missing or falsy!");
        console.error("Full response data:", JSON.stringify(data, null, 2));
        throw new Error("Order ID not received from server");
      }

      console.log("✅ Order ID validation passed, proceeding with product addition...");

      // Add products to order
      for (let i = 0; i < products.length; i++) {
        console.log(`🛍️ Adding product ${i + 1}/${products.length}:`, {
          orderId,
          productId: products[i].id,
          quantity: products[i].amount
        });
        
        await addOrderProduct(orderId, products[i].id, products[i].amount);
        console.log(`✅ Product ${i + 1} added successfully`);
      }

      console.log(" All products added successfully!");

      // Clear form and cart
      setCheckoutForm({
        name: "",
        lastname: "",
        phone: "",
        email: "",
        adress: "",
        apartment: "",
        wilaya: "16",
        orderNotice: "",
        paymentMethod: "cash_on_delivery",
        paymentProvider: "",
        cardNumber: "",
        cardCode: "",
        expirationDate: "",
      });
      setCouponCode("");
      clearCart();
      
      // Refresh notification count if user is logged in
      try {
        // This will trigger a refresh of notifications in the background
        window.dispatchEvent(new CustomEvent('orderCompleted'));
      } catch (error) {
        console.log('Note: Could not trigger notification refresh');
      }
      
      toast.success("Order created successfully! You will be contacted for payment.");
      setTimeout(() => {
        router.push(`/receipt/${orderId}`);
      }, 1000);
    } catch (error: any) {
      console.error("💥 Error in makePurchase:", error);
      
      // Handle server validation errors
      if (error.response?.status === 400) {
        console.log(" Handling 400 error...");
        try {
          const errorData = await error.response.json();
          console.log("Error data:", errorData);
          if (errorData.details && Array.isArray(errorData.details)) {
            // Show specific validation errors
            errorData.details.forEach((detail: any) => {
              toast.error(`${detail.field}: ${detail.message}`);
            });
          } else {
            toast.error(errorData.error || "Validation failed");
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          toast.error("Validation failed");
        }
      } else if (error.response?.status === 409) {
        toast.error("Duplicate order detected. Please wait before creating another order.");
      } else {
        console.log("🔍 Handling generic error...");
        toast.error("Failed to create order. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addOrderProduct = async (
    orderId: string,
    productId: string,
    productQuantity: number
  ) => {
    try {
      console.log("️ Adding product to order:", {
        customerOrderId: orderId,
        productId,
        quantity: productQuantity
      });
      
      const response = await apiClient.post("/api/order-product", {
        customerOrderId: orderId,
        productId: productId,
        quantity: productQuantity,
      });

      console.log("📡 Product order response:", response);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Product order failed:", response.status, errorText);
        throw new Error(`Product order failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Product order successful:", data);
      
    } catch (error) {
      console.error("💥 Error creating product order:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetch("/api/payment-settings", { cache: "no-store" }).then(async (response) => {
      if (response.ok) setPaymentAccounts(await response.json());
    }).catch(() => undefined);
    if (products.length === 0) {
      toast.error("You don't have items in your cart");
      router.push("/cart");
    }
  }, []);

  return (
    <div className="bg-white">
      <SectionTitle title="Checkout" path="Home | Cart | Checkout" />
      
      <div className="hidden h-full w-1/2 bg-white lg:block" aria-hidden="true" />
      <div className="hidden h-full w-1/2 bg-gray-50 lg:block" aria-hidden="true" />

      <main className="relative mx-auto grid max-w-screen-2xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 xl:gap-x-48">
        <h1 className="sr-only">Order information</h1>

        {/* Order Summary */}
        <section
          aria-labelledby="summary-heading"
          className="bg-gray-50 px-4 pb-10 pt-16 sm:px-6 lg:col-start-2 lg:row-start-1 lg:bg-transparent lg:px-0 lg:pb-16"
        >
          <div className="mx-auto max-w-lg lg:max-w-none">
            <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
              Order summary
            </h2>

            <ul
              role="list"
              className="divide-y divide-gray-200 text-sm font-medium text-gray-900"
            >
              {products.map((product) => {
                const hasSizeChoices = (product.sizeOptions?.length || 0) > 1;
                const hasColorChoices = (product.colorOptions?.length || 0) > 1;
                return (
                <li key={product?.id} className="flex items-start space-x-4 py-6">
                  <ProductImageCarousel productId={product.productId || product.id} mainImage={product.image} title={product.title} className="h-20 w-20 flex-none" imageClassName="h-full w-full rounded-md object-contain" />
                  <div className="flex-auto space-y-1">
                    <h3>{product?.title}</h3>
                    <p className="text-gray-500">x{product?.amount}</p>
                    {(product?.color || product?.size) && <p className="text-gray-500">{[product.color, product.size].filter(Boolean).join(" / ")}</p>}
                    {(hasSizeChoices || hasColorChoices) && <div className="mt-3 space-y-2">
                      {hasSizeChoices && <label className="block text-sm text-gray-700">Size
                        <select className="ml-2 rounded-md border-gray-300 text-sm" value={product.size || ""} onChange={(event) => updateCartVariant(product.id, event.target.value, product.color || null, getVariantPrice(product.basePrice ?? product.price, event.target.value, product.variantPrices))}>{product.sizeOptions?.map((size) => <option key={size}>{size}</option>)}</select>
                      </label>}
                      {hasColorChoices && <label className="block text-sm text-gray-700">Color
                        <select className="ml-2 rounded-md border-gray-300 text-sm" value={product.color || ""} onChange={(event) => updateCartVariant(product.id, product.size || null, event.target.value, product.price)}>{product.colorOptions?.map((color) => <option key={color}>{color}</option>)}</select>
                      </label>}
                    </div>}
                    {product?.couponPercent ? <p className="text-green-700">-{product.couponPercent}%</p> : null}
                  </div>
                    <p className="flex-none text-base font-medium">
                      {formatDZD(product?.price)}
                  </p>
                </li>
                );
              })}
            </ul>

            <dl className="hidden space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-900 lg:block">
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                  <dd>{formatDZD(discountedSubtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Shipping</dt>
                  <dd>{formatDZD(5)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Taxes</dt>
                  <dd>{formatDZD(discountedSubtotal / 5)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <dt className="text-base">Total</dt>
                  <dd className="text-base">
                    {formatDZD(orderTotal)}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <form className="px-4 pt-16 sm:px-6 lg:col-start-1 lg:row-start-1 lg:px-0">
          <div className="mx-auto max-w-lg lg:max-w-none">
            {/* Contact Information */}
            <section aria-labelledby="contact-info-heading">
              <h2
                id="contact-info-heading"
                className="text-lg font-medium text-gray-900"
              >
                Contact information
              </h2>

              <div className="mt-6">
                <label
                  htmlFor="name-input"
                  className="flex justify-between text-sm font-medium text-gray-700"
                >
                  <span>Name * (min 2 characters)</span><span dir="rtl">الاسم</span>
                </label>
                <div className="mt-1">
                  <input
                    value={checkoutForm.name}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        name: e.target.value,
                      })
                    }
                    type="text"
                    id="name-input"
                    name="name-input"
                    autoComplete="given-name"
                    required
                    disabled={isSubmitting}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="lastname-input"
                  className="flex justify-between text-sm font-medium text-gray-700"
                >
                  <span>Lastname * (min 2 characters)</span><span dir="rtl">اللقب</span>
                </label>
                <div className="mt-1">
                  <input
                    value={checkoutForm.lastname}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        lastname: e.target.value,
                      })
                    }
                    type="text"
                    id="lastname-input"
                    name="lastname-input"
                    autoComplete="family-name"
                    required
                    disabled={isSubmitting}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="phone-input"
                  className="flex justify-between text-sm font-medium text-gray-700"
                >
                  <span>Phone number * (min 10 digits)</span><span dir="rtl">الهاتف</span>
                </label>
                <div className="mt-1">
                  <input
                    value={checkoutForm.phone}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        phone: e.target.value,
                      })
                    }
                    type="tel"
                    id="phone-input"
                    name="phone-input"
                    autoComplete="tel"
                    required
                    disabled={isSubmitting}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="email-address"
                  className="flex justify-between text-sm font-medium text-gray-700"
                >
                  <span>Email address *</span><span dir="rtl">البريد الالكتروني</span>
                </label>
                <div className="mt-1">
                  <input
                    value={checkoutForm.email}
                    onChange={(e) =>
                      setCheckoutForm({
                        ...checkoutForm,
                        email: e.target.value,
                      })
                    }
                    type="email"
                    id="email-address"
                    name="email-address"
                    autoComplete="email"
                    required
                    disabled={isSubmitting}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </section>

            {/* Payment Notice */}
            <section className="mt-10">
              <h2 className="text-lg font-medium text-gray-900">Payment method / طريقة الدفع</h2>
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3">
                  <input type="radio" name="payment-method" value="online" checked={checkoutForm.paymentMethod === "online"} onChange={() => setCheckoutForm({ ...checkoutForm, paymentMethod: "online" })} disabled={isSubmitting} />
                  <span>Online payment / دفع إلكتروني</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="radio" name="payment-method" value="cash_on_delivery" checked={checkoutForm.paymentMethod === "cash_on_delivery"} onChange={() => setCheckoutForm({ ...checkoutForm, paymentMethod: "cash_on_delivery", paymentProvider: "" })} disabled={isSubmitting} />
                  <span>Payment at delivery / الدفع عند الاستلام</span>
                </label>
              </div>
              {checkoutForm.paymentMethod === "online" && <div className="mt-5 space-y-4 border border-gray-200 p-4">
                <label className="block text-sm font-medium">Transfer method / طريقة التحويل
                  <select className="mt-1 block w-full rounded-md border-gray-300" value={checkoutForm.paymentProvider} onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentProvider: e.target.value })}>
                    <option value="">Choose a method</option><option value="CCP Transfer">CCP / BaridiMob</option><option value="Bank Transfer">Bank transfer</option>
                  </select>
                </label>
                {checkoutForm.paymentProvider === "CCP Transfer" && <p className="rounded bg-gray-50 p-3 text-sm">CCP account: {paymentAccounts.ccpAccount || "The seller has not added a CCP account yet."}</p>}
                {checkoutForm.paymentProvider === "Bank Transfer" && <p className="rounded bg-gray-50 p-3 text-sm">Bank account: {paymentAccounts.bankAccount || "The seller has not added a bank account yet."}</p>}
              </div>}
              <div className="mt-5 border border-gray-200 p-4">
                <label htmlFor="coupon-code" className="block text-sm font-medium text-gray-700">Coupon code / رمز التخفيض</label>
                <div className="mt-2 flex gap-2">
                  <input id="coupon-code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} disabled={isSubmitting} placeholder="WELCOME10" className="min-w-0 flex-1 rounded-md border-gray-300 shadow-sm" />
                </div>
                {normalizedCoupon && couponProducts.length > 0 && <p className="mt-2 text-sm text-green-600">Coupon applied: -{Math.round(discount)} DZD</p>}
                {normalizedCoupon && couponProducts.length === 0 && <p className="mt-2 text-sm text-red-600">Coupon not available for items in your cart.</p>}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Payment Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Payment will be processed after order confirmation. You will be contacted for payment details.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section aria-labelledby="shipping-heading" className="mt-10">
              <h2
                id="shipping-heading"
                className="text-lg font-medium text-gray-900"
              >
                Shipping address
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="address"
                    className="flex justify-between text-sm font-medium text-gray-700"
                  >
                    <span>Address *</span><span dir="rtl">العنوان</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      autoComplete="street-address"
                      required
                      disabled={isSubmitting}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={checkoutForm.adress}
                      onChange={(e) =>
                        setCheckoutForm({
                          ...checkoutForm,
                          adress: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="apartment"
                    className="flex justify-between text-sm font-medium text-gray-700"
                  >
                    <span>Apartment, suite, etc. * (required)</span><span dir="rtl">رقم المنزل</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="apartment"
                      name="apartment"
                      required
                      disabled={isSubmitting}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={checkoutForm.apartment}
                      onChange={(e) =>
                        setCheckoutForm({
                          ...checkoutForm,
                          apartment: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="wilaya" className="flex justify-between text-sm font-medium text-gray-700">
                    <span>Wilaya *</span><span dir="rtl">الولاية</span>
                  </label>
                  <div className="mt-1">
                    <select id="wilaya" name="wilaya" required disabled={isSubmitting} value={checkoutForm.wilaya} onChange={(e) => setCheckoutForm({ ...checkoutForm, wilaya: e.target.value })} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed">
                      {algerianWilayas.map(([code, name]) => <option value={code} key={code}>{code} - {name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="order-notice"
                    className="flex justify-between text-sm font-medium text-gray-700"
                  >
                    <span>Order notice</span><span dir="rtl">ملاحظة</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      className="textarea textarea-bordered textarea-lg w-full disabled:bg-gray-100 disabled:cursor-not-allowed"
                      id="order-notice"
                      name="order-notice"
                      autoComplete="order-notice"
                      disabled={isSubmitting}
                      value={checkoutForm.orderNotice}
                      onChange={(e) =>
                        setCheckoutForm({
                          ...checkoutForm,
                          orderNotice: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-10 border-t border-gray-200 pt-6 ml-0">
              <button
                type="button"
                onClick={makePurchase}
                disabled={isSubmitting}
                className="w-full rounded-md border border-transparent bg-blue-500 px-20 py-2 text-lg font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-50 sm:order-last disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing Order... / جارٍ تنفيذ الطلب..." : "Place Order / اطلب الآن"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CheckoutPage;
