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
      <DiscountedPrice price={selectedPrice} couponPercent={product.couponPercent} className="text-xl font-semibold" />
      <QuantityInput
        quantityCount={quantityCount}
        setQuantityCount={setQuantityCount}
      />
      {(sizes.length > 0 || colors.length > 0) && <div className="flex flex-wrap gap-4">
        {sizes.length > 0 && <label className="form-control"><span className="label-text">Size:</span><select className="select select-bordered" value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)}>{sizes.map((size) => <option key={size}>{size}</option>)}</select></label>}
        {colors.length > 0 && <label className="form-control"><span className="label-text">Color:</span><select className="select select-bordered" value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)}>{colors.map((color) => <option key={color}>{color}</option>)}</select></label>}
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
