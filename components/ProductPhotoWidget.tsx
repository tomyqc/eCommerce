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
  const [activeIndex, setActiveIndex] = useState(0);

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

  const product = products[activeIndex % products.length];
  return <div className="relative left-1/2 mt-8 h-96 w-screen -translate-x-1/2 overflow-hidden bg-transparent max-md:h-72" aria-label="Featured product photos">
    <div key={`${product.id}-${activeIndex}`} className="animate-new-product-cycle absolute inset-0 flex items-center justify-center" onAnimationEnd={() => setActiveIndex((index) => (index + 1) % products.length)}>
      <img
        src={getProductImageUrl(product.mainImage, product.inStock, product.isNew, Boolean(product.isSold || (product.couponCode && Number(product.couponPercent) > 0)))}
        alt={product.title}
        className="h-[86%] w-full max-w-xl object-contain"
        onError={(event) => {
          event.currentTarget.src = "/product_placeholder.jpg";
        }}
      />
      <Link href={`/product/${product.slug}`} className="absolute bottom-3 text-center text-lg font-semibold text-black">
        <span className="block">{product.title}</span>
        <span className="block text-base">{formatDZD(product.price)}</span>
      </Link>
    </div>
  </div>;
};

export default ProductPhotoWidget;
