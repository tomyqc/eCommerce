// *********************
// Role of the component: Showing products on the shop page with applied filter and sort
// Name of the component: Products.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <Products params={params} searchParams={searchParams} />
// Input parameters: { params, searchParams }: { params: { slug?: string[] }, searchParams: { [key: string]: string | string[] | undefined } }
// Output: products grid
// *********************

import React from "react";
import prisma from "@/utils/db";
import PaginatedProductGrid from "./PaginatedProductGrid";

const Products = async ({ params, searchParams, totalPages = 1 }: { params: { slug?: string[] }, searchParams: { [key: string]: string | string[] | undefined }, totalPages?: number }) => {
  // getting all data from URL slug and preparing everything for sending GET request
  const page = searchParams?.page ? Number(searchParams?.page) : 1;

  let products: any[] = [];
  let categoryName = "";
  if (params?.slug?.[0]) {
    try {
      categoryName = decodeURIComponent(params.slug[0]);
    } catch {
      categoryName = params.slug[0];
    }
  }

  try {
    const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "";
    const orderBy = sort === "titleAsc" ? { title: "asc" as const }
      : sort === "titleDesc" ? { title: "desc" as const }
      : sort === "lowPrice" ? { price: "asc" as const }
      : sort === "highPrice" ? { price: "desc" as const }
      : { id: "asc" as const };
    products = await prisma.product.findMany({
      where: categoryName ? { category: { name: categoryName } } : undefined,
      skip: (page - 1) * 9,
      take: 9,
      include: { category: { select: { name: true } } },
      orderBy,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    products = [];
  }

  return products.length > 0 ? <PaginatedProductGrid initialProducts={products} initialPage={page} totalPages={totalPages} pageSize={9} endpoint={`/api/products?sort=${typeof searchParams?.sort === "string" ? encodeURIComponent(searchParams.sort) : ""}${categoryName ? `&category=${encodeURIComponent(categoryName)}` : ""}`} /> : (
        <h3 className="text-3xl mt-5 text-center w-full col-span-full max-[1000px]:text-2xl max-[500px]:text-lg">
          No products found for specified query
        </h3>
      );
};

export default Products;
