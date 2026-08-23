"use client"

import { useProductStore } from "@/app/_zustand/store";
import toast from "react-hot-toast";
import Link from "next/link";
import { FaCheck, FaCircleQuestion, FaClock, FaXmark } from "react-icons/fa6";
import QuantityInputCart from "@/components/QuantityInputCart";
import { sanitize } from "@/lib/sanitize";
import { formatDZD } from "@/lib/currency";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import DiscountedPrice from "@/components/DiscountedPrice";
import { useEffect, useState } from "react";

export const CartModule = () => {

  const { products, removeFromCart, calculateTotals, total } =
    useProductStore();
  const [shippingCost, setShippingCost] = useState(5);
  useEffect(() => { fetch("/api/payment-settings", { cache: "no-store" }).then(async (response) => { if (response.ok) setShippingCost((await response.json()).shippingCost ?? 5); }).catch(() => undefined); }, []);

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    calculateTotals();
    toast.success("Product removed from the cart");
  };
  return (

    <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
      <section aria-labelledby="cart-heading" className="lg:col-span-7">
        <h2 id="cart-heading" className="sr-only">
          Items in your shopping cart
        </h2>

        <ul
          role="list"
          className="divide-y divide-gray-200 border-b border-t border-gray-200"
        >
          {products.map((product) => (
            <li key={product.id} className="flex py-6 sm:py-10">
              <ProductImageCarousel productId={product.productId || product.id} mainImage={product.image} title={product.title} className="h-24 w-24 flex-shrink-0 sm:h-48 sm:w-48" imageClassName="h-full w-full rounded-md object-contain" />

              <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                  <div>
                    <div className="flex justify-between">
                      <h3 className="text-sm">
                        <Link
                          href={`#`}
                          className="font-medium text-gray-700 hover:text-gray-800"
                        >
                          {sanitize(product.title)}
                        </Link>
                      </h3>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-gray-500">
                      {product.color && <span>{product.color}</span>}
                      {product.size && <span>{product.size}</span>}
                    </div>
                    <DiscountedPrice price={product.price} couponPercent={product.couponPercent} className="mt-1 text-sm font-medium text-gray-900" />
                  </div>

                  <div className="mt-4 sm:mt-0 sm:pr-9">
                    <QuantityInputCart product={product} />
                    <div className="absolute right-0 top-0">
                      <button
                        onClick={() => handleRemoveItem(product.id)}
                        type="button"
                        className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Remove</span>
                        <FaXmark className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                  {1 ? (
                    <FaCheck
                      className="h-5 w-5 flex-shrink-0 text-green-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <FaClock
                      className="h-5 w-5 flex-shrink-0 text-gray-300"
                      aria-hidden="true"
                    />
                  )}

                  <span>{1 ? "In stock" : `Ships in 3 days`}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Order summary */}
      <section
        aria-labelledby="summary-heading"
        className="mt-16 rounded-lg border border-gray-200 bg-transparent px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
      >
        <h2
          id="summary-heading"
          className="text-lg font-medium text-gray-900"
        >
          عملية الطلب
        </h2>

        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-gray-600">السعر</dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatDZD(total)}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="flex items-center text-sm text-gray-600">
              <span>سعر التوصيل</span>
              <a
                href="#"
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">
                  Learn more about how shipping is calculated
                </span>
                <FaCircleQuestion
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </a>
            </dt>
            <dd className="text-sm font-medium text-gray-900">{formatDZD(shippingCost)}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <dt className="text-base font-medium text-gray-900">
              المجموع
            </dt>
            <dd className="text-base font-medium text-gray-900">
              {formatDZD(total === 0 ? 0 : Math.round(total + shippingCost))}
            </dd>
          </div>
        </dl>
        {products.length > 0 && (
          <div className="mt-6">
            <Link
              href="/checkout"
              className="block flex justify-center items-center w-full uppercase bg-transparent px-4 py-3 text-base border border-black border-gray-300 font-bold text-blue-600 shadow-sm hover:bg-black hover:bg-gray-100 focus:outline-none focus:ring-2"
            >
              <span>Checkout</span>
            </Link>
          </div>
        )}
      </section>
    </form>

  )

}
