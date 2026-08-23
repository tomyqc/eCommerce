"use client";

import { useState } from "react";
import ProductItem from "./ProductItem";

type PaginatedProductGridProps = {
  initialProducts: Product[];
  initialPage: number;
  totalPages: number;
  pageSize: number;
  endpoint: string;
  columns: "home" | "shop";
};

export default function PaginatedProductGrid({ initialProducts, initialPage, totalPages, pageSize, endpoint, columns }: PaginatedProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(initialPage);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const [transitionKey, setTransitionKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = async (nextPage: number) => {
    if (loading || nextPage < 1 || nextPage > totalPages) return;
    setLoading(true);
    const nextDirection = nextPage > page ? "next" : "previous";
    try {
      const response = await fetch(`${endpoint}${endpoint.includes("?") ? "&" : "?"}page=${nextPage}&limit=${pageSize}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (!Array.isArray(data)) return;
      setDirection(nextDirection);
      setProducts(data);
      setPage(nextPage);
      setTransitionKey((key) => key + 1);
    } finally {
      setLoading(false);
    }
  };

  return <>
    <div key={transitionKey} className={`grid ${columns === "home" ? "grid-cols-5 max-md:grid-cols-3 max-[500px]:grid-cols-2" : "grid-cols-3 max-lg:grid-cols-2 max-[500px]:grid-cols-1"} justify-items-center gap-x-1 gap-y-5 px-2 py-5 ${direction === "next" ? "animate-products-next" : "animate-products-previous"}`}>
      {products.map((product) => <ProductItem key={product.id} product={product} color="black" />)}
    </div>
    {totalPages > 1 && <div className="join flex justify-center py-8">
      {page > 1 && <button type="button" className="join-item btn btn-lg bg-blue-500 text-white hover:bg-white hover:text-blue-500" onClick={() => navigate(page - 1)} disabled={loading} aria-label="Previous products">«</button>}
      <span className="join-item btn btn-lg bg-blue-500 text-white">Page {page}</span>
      {page < totalPages && <button type="button" className="join-item btn btn-lg bg-blue-500 text-white hover:bg-white hover:text-blue-500" onClick={() => navigate(page + 1)} disabled={loading} aria-label="Next products">»</button>}
    </div>}
  </>;
}