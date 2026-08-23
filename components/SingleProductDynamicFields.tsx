// *********************
// Role of the component: Helper component for seperating dynamic client component from server component on the single product page with the intention to preserve SEO benefits of Next.js
// Name of the component: SingleProductDynamicFields.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <SingleProductDynamicFields product={product} />
// Input parameters: { product: Product }
// Output: Quantity, add to cart and buy now component on the single product page
// *********************

"use client";
import React, { useState } from "react";
import QuantityInput from "./QuantityInput";
import AddToCartSingleProductBtn from "./AddToCartSingleProductBtn";
import BuyNowSingleProductBtn from "./BuyNowSingleProductBtn";
import { parseOptions } from "@/lib/product-variants";
import { getVariantPrice } from "@/lib/product-variants";
import DiscountedPrice from "./DiscountedPrice";

const SingleProductDynamicFields = ({ product }: { product: Product }) => {
  const [quantityCount, setQuantityCount] = useState<number>(1);
  const sizes = parseOptions(product.size);
  const colors = parseOptions(product.color);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  const selectedPrice = getVariantPrice(product.price, selectedSize, product.variantPrices);
  return (
    <>
      <div className="grid w-full max-w-md grid-cols-[1fr_auto_1fr] items-center gap-3 text-xl max-[500px]:gap-2">
        <span className="text-left">Price:</span>
        <DiscountedPrice price={selectedPrice} couponPercent={product.couponPercent} className="text-center font-semibold" />
        <span className="text-right" dir="rtl">السعر:</span>
      </div>
      <QuantityInput
        quantityCount={quantityCount}
        setQuantityCount={setQuantityCount}
      />
      {(sizes.length > 0 || colors.length > 0) && <div className="flex w-full max-w-md flex-col gap-3">
        {colors.length > 0 && <label className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xl max-[500px]:gap-2"><span className="text-left">Color:</span><select className="select select-bordered" value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)}>{colors.map((color) => <option key={color}>{color}</option>)}</select><span className="text-right" dir="rtl">اللون</span></label>}
        {sizes.length > 0 && <label className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xl max-[500px]:gap-2"><span className="text-left">Size:</span><select className="select select-bordered" value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)}>{sizes.map((size) => <option key={size}>{size}</option>)}</select><span className="text-right" dir="rtl">الحجم</span></label>}
      </div>}
      {Boolean(product.inStock) && (
        <div className="flex gap-x-5 max-[500px]:flex-col max-[500px]:items-center max-[500px]:gap-y-1">
          <AddToCartSingleProductBtn
            quantityCount={quantityCount}
            product={product}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
          />
          <BuyNowSingleProductBtn
            quantityCount={quantityCount}
            product={product}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
          />
        </div>
      )}
    </>
  );
};

export default SingleProductDynamicFields;
