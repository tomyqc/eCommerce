// *********************
// Role of the component: Product item component 
// Name of the component: ProductItem.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <ProductItem product={product} color={color} />
// Input parameters: { product: Product; color: string; }
// Output: Product item component that contains product image, title, link to the single product page, price, button...
// *********************

import React from "react";
import Link from "next/link";

import { sanitize } from "@/lib/sanitize";
import { FaStar } from "react-icons/fa6";
import DiscountedPrice from "@/components/DiscountedPrice";
import ProductImageCarousel from "@/components/ProductImageCarousel";

const ProductItem = ({
  product,
  color,
}: {
  product: Product;
  color: string;
}) => {
  return (
    <div className="flex min-w-0 w-full flex-col items-center gap-y-1 text-center">
      <ProductImageCarousel
        productId={product.id}
        mainImage={product.mainImage}
        title={sanitize(product?.title) || "Product image"}
        className="h-56 w-full"
        imageClassName="h-full w-full object-contain [mask-image:radial-gradient(ellipse_at_center,black_78%,transparent_100%)]"
      />
      <Link
        href={`/product/${product.slug}`}
        className={
          color === "black"
            ? `mt-1 flex min-h-[1.2rem] w-full items-start justify-center text-[0.75rem] font-normal uppercase leading-[0.6rem] text-black`
            : `mt-1 flex min-h-[1.2rem] w-full items-start justify-center text-[0.75rem] font-normal uppercase leading-[0.6rem] text-white`
        }
      >
        {sanitize(product.title)}
      </Link>
      <DiscountedPrice
        price={product.price}
        couponPercent={product.couponPercent}
        className={color === "black" ? "w-full text-[0.675rem] leading-[0.6rem] text-black" : "w-full text-[0.675rem] leading-[0.6rem] text-white"}
      />
      <div className="flex items-center gap-0.5" aria-label={`${product.rating ?? 0} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => (
          <FaStar key={index} className={index < Math.round(product.rating ?? 0) ? "text-[0.55rem] text-yellow-500" : "text-[0.55rem] text-gray-300"} aria-hidden="true" />
        ))}
      </div>
    </div>
  );
};

export default ProductItem;
