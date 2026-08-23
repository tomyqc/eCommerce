// *********************
// Role of the component: products section intended to be on the home page
// Name of the component: ProductsSection.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <ProductsSection slug={slug} />
// Input parameters: no input parameters
// Output: products grid
// *********************

import React from "react";
import ProductItem from "./ProductItem";
import Heading from "./Heading";
import prisma from "@/utils/db";

const ProductsSection = async () => {
  let products: any[] = [];
  
  try {
    products = await prisma.product.findMany({ orderBy: { id: "asc" }, include: { category: { select: { name: true } } } });
  } catch (error) {
    console.error('Error fetching products:', error);
    products = [];
  }

  return (
    <div className="bg-transparent border-0">
      <div className="mx-auto max-w-screen-2xl pt-5">
        <Heading title="Products المنتوجات" className="mt-5" />
        <div className="mx-auto grid w-full grid-cols-5 justify-items-center gap-x-1 gap-y-5 px-2 py-5">
          {products.length > 0 ? (
            products.map((product: Product) => (
              <ProductItem key={product.id} product={product} color="black" />
            ))
          ) : (
            <div className="col-span-full text-center text-black py-10">
              <p>No products available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;
