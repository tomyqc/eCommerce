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
import Heading from "./Heading";
import prisma from "@/utils/db";
import PaginatedProductGrid from "./PaginatedProductGrid";

const ProductsSection = async ({ page = 1, totalPages = 1 }: { page?: number; totalPages?: number }) => {
  let products: any[] = [];
  
  try {
    products = await prisma.product.findMany({ orderBy: { id: "asc" }, skip: (page - 1) * 15, take: 15, include: { category: { select: { name: true } } } });
  } catch (error) {
    console.error('Error fetching products:', error);
    products = [];
  }

  return (
    <div className="bg-transparent border-0">
      <div className="mx-auto max-w-screen-2xl pt-5">
        <Heading title="Products المنتوجات" className="mt-5" />
        {products.length > 0 ? <PaginatedProductGrid initialProducts={products} initialPage={page} totalPages={totalPages} pageSize={15} endpoint="/api/products" columns="home" /> : (
            <div className="col-span-full text-center text-black py-10">
              <p>No products available at the moment.</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default ProductsSection;
