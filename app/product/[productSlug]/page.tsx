import {
  StockAvailabillity,
  UrgencyText,

  ProductTabs,
  SingleProductDynamicFields,
  PaymentLogos,
} from "@/components";
import { notFound } from "next/navigation";
import React from "react";
import { FaSquareFacebook } from "react-icons/fa6";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaSquarePinterest } from "react-icons/fa6";
import { sanitize } from "@/lib/sanitize";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import prisma from "@/utils/db";

interface SingleProductPageProps {
  params: Promise<{  productSlug: string, id: string }>;
}

const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const paramsAwaited = await params;
  const productData = await prisma.product.findUnique({
    where: { slug: paramsAwaited?.productSlug },
    include: { category: true },
  });
  const product = productData ? { ...productData, variantPrices: productData.variantPrices as Product["variantPrices"] } : null;

  // sending API request for more than 1 product image if it exists
  if (!product) {
    notFound();
  }

  return (
    <div className="bg-white">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex justify-center gap-x-16 pt-10 max-lg:flex-col items-center gap-y-5 px-5">
          <div>
            <ProductImageCarousel productId={product?.id} mainImage={product?.mainImage} title={product?.title} className="h-[540px] w-[500px] max-w-full" />
          </div>
          <div className="flex flex-col gap-y-7 text-black max-[500px]:text-center">
        
            <div className="flex flex-wrap items-center gap-2 max-[500px]:justify-center">
              <h1 className="text-3xl">{sanitize(product?.title)}</h1>
              {product?.isNew && <span className="bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">NEW</span>}
              {product?.isSold && <span className="bg-red-100 px-2 py-1 text-xs font-bold text-red-700">PROMO</span>}
            </div>
            {product?.couponCode && Number(product?.couponPercent) > 0 && <p className="w-fit bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 max-[500px]:mx-auto">Coupon {product.couponCode}: -{product.couponPercent}%</p>}
            <StockAvailabillity stock={94} inStock={product?.inStock} />
            <SingleProductDynamicFields product={product} />
            <div className="flex flex-col gap-y-2 max-[500px]:items-center">
             
              <p className="text-lg">
                SKU: <span className="ml-1">abccd-18</span>
              </p>
              <div className="text-lg flex gap-x-2">
                <span>Share:</span>
                <div className="flex items-center gap-x-1 text-2xl">
                  <FaSquareFacebook />
                  <FaSquareXTwitter />
                  <FaSquarePinterest />
                </div>
              </div>
              <PaymentLogos />
            </div>
          </div>
        </div>
        <div className="py-16">
          <ProductTabs product={product} />
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;
