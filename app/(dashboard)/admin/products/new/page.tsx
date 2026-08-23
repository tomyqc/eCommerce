"use client";
import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import { sanitizeFormData } from "@/lib/form-sanitize";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProductImageUrl } from "@/lib/product-image";
import VariantPriceEditor from "@/components/VariantPriceEditor";
import { VariantPrices } from "@/lib/product-variants";

const COLOR_OPTIONS = ["أسود", "أبيض", "أخضر", "أصفر", "أحمر", "أزرق", "رمادي", "شفاف", "وردي"];

const AddNewProduct = () => {
  const [product, setProduct] = useState<{
    merchantId?: string;
    title: string;
    price: number;
    manufacturer: string;
    size: string;
    color: string;
    inStock: number;
    quantity: number;
    isNew: boolean;
    isSold: boolean;
    couponCode: string;
    couponPercent: number;
    mainImage: string;
    description: string;
    slug: string;
    categoryId: string;
    variantPrices: VariantPrices;
  }>({
    merchantId: "",
    title: "",
    price: 0,
    manufacturer: "",
    size: "",
    color: "",
    inStock: 1,
    quantity: 1,
    isNew: false,
    isSold: false,
    couponCode: "",
    couponPercent: 0,
    mainImage: "",
    description: "",
    slug: "",
    categoryId: "",
    variantPrices: {},
  });
  const [otherColor, setOtherColor] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const addProduct = async () => {
    const requiredFields = {
      merchantId: product.merchantId?.trim(),
      title: product.title.trim(),
      manufacturer: product.manufacturer.trim(),
      description: product.description.trim(),
      slug: product.slug.trim(),
      categoryId: product.categoryId.trim(),
    };

    const missingField = Object.entries(requiredFields).find(([, value]) => !value)?.[0];
    if (missingField) {
      toast.error(`Please enter a ${missingField}`);
      return;
    }

    if (!Number.isFinite(product.price) || product.price <= 0) {
      toast.error("Please enter a valid product price");
      return;
    }

    try {
      // Sanitize form data before sending to API
      const sanitizedProduct = sanitizeFormData({
        ...product,
        ...requiredFields,
      });

      console.log("Sending product data:", sanitizedProduct);

      // Correct usage of apiClient.post
      const response = await apiClient.post(`/api/products`, sanitizedProduct);

      if (response.status === 201) {
        const data = await response.json();
        for (const image of additionalImages) {
          await apiClient.post("/api/images", { productID: data.id, image });
        }
        console.log("Product created successfully:", data);
        toast.success("Product added successfully");
        setProduct((currentProduct) => ({
          ...currentProduct,
          merchantId: "",
          title: "",
          price: 0,
          manufacturer: "",
          mainImage: "",
          description: "",
          slug: "",
          categoryId: categories[0]?.id || "",
          size: "",
          color: "",
          variantPrices: {},
        }));
        setSelectedColors([]);
        setOtherColor("");
        setAdditionalImages([]);
      } else {
        const errorData = await response.json();
        console.error("Failed to create product:", errorData);
        toast.error(errorData.error || errorData.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const fetchMerchants = async () => {
    try {
      const res = await apiClient.get("/api/merchants");
      const data: Merchant[] = await res.json();
      setMerchants(data || []);
      setProduct((prev) => ({
      ...prev,
        merchantId: prev.merchantId || data?.[0]?.id || "",
      }));
    } catch (e) {
      toast.error("Failed to load merchants");
    }
  };

  const uploadFile = async (file: any) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);

    try {
      const response = await apiClient.post("/api/main-image", formData);

      if (response.ok) {
        const result = await response.json();
        setProduct((currentProduct) => ({
          ...currentProduct,
          mainImage: result.fileName ? `${apiClient.baseUrl}/media/${result.fileName}` : file.name,
        }));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "File upload unsuccessful");
      }
    } catch (error) {
      console.error("Error happend while sending request:", error);
      toast.error("There was an error during file upload");
    }
  };

  const uploadAdditionalImage = async (file: File) => {
    if (additionalImages.length >= 4) {
      toast.error("A product can have a maximum of 5 photos including its main photo");
      return;
    }
    const formData = new FormData();
    formData.append("uploadedFile", file);
    const response = await apiClient.post("/api/main-image", formData);
    if (!response.ok) throw new Error("Photo upload unsuccessful");
    const { fileName } = await response.json();
    setAdditionalImages((current) => [...current, `${apiClient.baseUrl}/media/${fileName}`]);
  };

  const fetchCategories = async () => {
    apiClient
      .get(`/api/categories`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setProduct((currentProduct) => ({
          ...currentProduct,
          categoryId: currentProduct.categoryId || data[0]?.id || "",
        }));
      });
  };

  useEffect(() => {
    fetchCategories();
    fetchMerchants();
  }, []);

  return (
    <div className="bg-transparent flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="flex flex-col gap-y-7 xl:ml-5 max-xl:px-5 w-full">
        <h1 className="text-3xl font-semibold">Add new product</h1>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Merchant Info:</span>
            </div>
            <select
              className="select select-bordered"
              value={product?.merchantId}
              onChange={(e) =>
                setProduct({ ...product, merchantId: e.target.value })
              }
            >
              {merchants.map((merchant) => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.name}
                </option>
              ))}
            </select>
            {merchants.length === 0 && (
              <span className="text-xs text-red-500 mt-1">
                Please create a merchant first.
              </span>
            )}
          </label>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="form-control w-full max-w-xs"><span className="label-text">Size:</span><input type="text" className="input input-bordered" value={product.size} placeholder="S, XL, 1000 g, 2 kg" onChange={(e) => setProduct({ ...product, size: e.target.value })} /></label>
          <label className="form-control w-full max-w-xs"><span className="label-text">Color (multiple):</span><div className="grid grid-cols-2 gap-2 rounded border border-gray-300 p-3">{COLOR_OPTIONS.map((color) => <label key={color} className="flex items-center gap-2"><input type="checkbox" className="checkbox checkbox-sm" checked={selectedColors.includes(color)} onChange={(e) => { const values = e.target.checked ? [...selectedColors, color] : selectedColors.filter((item) => item !== color); setSelectedColors(values); setProduct({ ...product, color: [...values, ...(otherColor ? [otherColor] : [])].join(", ") }); }} /><span>{color}</span></label>)}</div><input type="text" className="input input-bordered mt-2" value={otherColor} placeholder="Other color (optional)" onChange={(e) => { setOtherColor(e.target.value); setProduct({ ...product, color: [...selectedColors, ...(e.target.value ? [e.target.value] : [])].join(", ") }); }} /></label>
          <VariantPriceEditor size={product.size} variantPrices={product.variantPrices} onChange={(nextSize, variantPrices) => setProduct({ ...product, size: nextSize, variantPrices })} />
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="label cursor-pointer gap-3"><span className="label-text">New product</span><input type="checkbox" className="toggle toggle-primary" checked={product.isNew} onChange={(e) => setProduct({ ...product, isNew: e.target.checked })} /></label>
          <label className="label cursor-pointer gap-3"><span className="label-text">Promo</span><input type="checkbox" className="toggle toggle-primary" checked={product.isSold} onChange={(e) => setProduct({ ...product, isSold: e.target.checked })} /></label>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="form-control w-full max-w-xs"><span className="label-text">Coupon code</span><input type="text" className="input input-bordered" value={product.couponCode} onChange={(e) => setProduct({ ...product, couponCode: e.target.value.toUpperCase() })} placeholder="WELCOME10" /></label>
          <label className="form-control w-40"><span className="label-text">Discount %</span><input type="number" min="0" max="100" className="input input-bordered" value={product.couponPercent} onChange={(e) => setProduct({ ...product, couponPercent: Number(e.target.value) })} /></label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product name:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.title}
              onChange={(e) => {
                const title = e.target.value;
                setProduct({
                  ...product,
                  title,
                  slug: product.slug || convertSlugToURLFriendly(title),
                });
              }}
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product slug:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={convertSlugToURLFriendly(product?.slug)}
              onChange={(e) =>
                setProduct({
                  ...product,
                  slug: convertSlugToURLFriendly(e.target.value),
                })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Category:</span>
            </div>
            <select
              className="select select-bordered"
              value={product?.categoryId}
              onChange={(e) =>
                setProduct({ ...product, categoryId: e.target.value })
              }
            >
              {categories &&
                categories.map((category: any) => (
                  <option key={category?.id} value={category?.id}>
                    {category?.name}
                  </option>
                ))}
            </select>
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product price:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.price}
              onChange={(e) =>
                setProduct({ ...product, price: Number(e.target.value) })
              }
            />
          </label>
        </div>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Manufacturer:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.manufacturer}
              onChange={(e) =>
                setProduct({ ...product, manufacturer: e.target.value })
              }
            />
          </label>
        </div>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Available quantity:</span>
            </div>
            <input
              type="number"
              min="0"
              step="1"
              className="input input-bordered w-full max-w-xs"
              value={product.quantity}
              onChange={(e) =>
                setProduct({ ...product, quantity: Math.max(0, Math.floor(Number(e.target.value))) })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Is product in stock?</span>
            </div>
            <select
              className="select select-bordered"
              value={product.quantity > 0 ? 1 : 0}
              onChange={(e) => setProduct({ ...product, quantity: Number(e.target.value) === 0 ? 0 : Math.max(1, product.quantity) })}
            >
              <option value={1}>In stock</option>
              <option value={0}>Out of stock</option>
            </select>
          </label>
        </div>
        <div>
          <input
            type="file"
            className="file-input file-input-bordered file-input-lg w-full max-w-sm"
            onChange={(e: any) => {
              const file = e.target.files?.[0];
              if (!file) return;
              uploadFile(file);
            }}
          />
          {product?.mainImage && (
            <div className="relative w-fit">
              <Image
                src={getProductImageUrl(product?.mainImage, product?.inStock, product?.isNew, Boolean(product?.isSold || (product?.couponCode && Number(product?.couponPercent) > 0)))}
                alt={product?.title}
                className="w-auto h-auto"
                width={100}
                height={100}
              />
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            {additionalImages.map((image, index) => <div key={`${image}-${index}`}><Image src={image} alt={`product photo ${index + 2}`} width={100} height={100} className="h-24 w-24 object-contain" /></div>)}
          </div>
          {additionalImages.length + (product.mainImage ? 1 : 0) < 5 && <label className="btn btn-outline mt-3">Add photo<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAdditionalImage(e.target.files[0]).catch((error) => toast.error(error.message))} /></label>}
          <p className="mt-2 text-sm text-gray-600">{additionalImages.length + (product.mainImage ? 1 : 0)}/5 photos</p>
        </div>
        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Product description:</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-24"
              value={product?.description}
              onChange={(e) =>
                setProduct({ ...product, description: e.target.value })
              }
            ></textarea>
          </label>
        </div>
        <div className="flex gap-x-2">
          <button
            onClick={addProduct}
            type="button"
            className="uppercase bg-blue-500 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2"
          >
            Add product
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewProduct;
