"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { formatDZD } from "@/lib/currency";
import { getProductImageUrl } from "@/lib/product-image";

type ProductPhoto = {
  id: string;
  title: string;
  slug: string;
  price: number;
  mainImage?: string;
  inStock?: number;
  isNew?: boolean;
  isSold?: boolean;
  couponCode?: string | null;
  couponPercent?: number;
};

const ProductPhotoWidget = () => {
  const [products, setProducts] = useState<ProductPhoto[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const response = await fetch("/api/featured-products", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (isMounted) setProducts(Array.isArray(data) ? data : []);
      } catch {
        // Keep the widget hidden while the product service is unavailable.
      }
    };

    loadProducts();
    const refreshTimer = window.setInterval(loadProducts, 30000);
    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="relative left-1/2 mt-8 h-96 w-screen -translate-x-1/2 overflow-hidden bg-transparent max-md:h-72" aria-label="Featured product photos">
      <div className="flex h-full w-max animate-product-marquee" style={{ animationDuration: `${Math.max(products.length * 2.5, 18)}s` }}>
        {[...products, ...products].map((product, productIndex) => (
          <Link
            key={`${product.id}-${productIndex}`}
            href={`/product/${product.slug}`}
            className="flex h-full w-[20vw] min-w-[20vw] shrink-0 flex-col items-center justify-center px-5 py-5 max-md:w-[50vw] max-md:min-w-[50vw]"
          >
            <div className="relative h-[78%] w-full">
              <img
                src={getProductImageUrl(product.mainImage, product.inStock, product.isNew, Boolean(product.isSold || (product.couponCode && Number(product.couponPercent) > 0)))}
                alt={product.title}
                className="h-full w-full object-contain"
                onError={(event) => {
                  event.currentTarget.src = "/product_placeholder.jpg";
                }}
              />
            </div>
            <p className="mt-2 text-lg font-semibold text-black">{formatDZD(product.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductPhotoWidget;
