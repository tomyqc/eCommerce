"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import Heading from "@/components/Heading";
import { getProductImageUrl } from "@/lib/product-image";

type PromotionProduct = {
  id: string;
  slug: string;
  title: string;
  mainImage: string;
  price: number;
  inStock: number;
  isNew: boolean;
  isSold: boolean;
  couponCode?: string | null;
  couponPercent: number;
};
const PromotionWidget = () => {
  const [products, setProducts] = useState<PromotionProduct[]>([]);

  useEffect(() => {
    apiClient.get("/api/products", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const data = await response.json();
      setProducts((Array.isArray(data) ? data : []).filter((product) => product.isNew || product.isSold || (product.couponCode && product.couponPercent > 0)));
    }).catch(() => undefined);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-5" aria-label="Promotions">
      <Heading title="New Products المنتوجات الجديدة" className="mt-10" />
      <div className="relative left-1/2 h-96 w-screen -translate-x-1/2 overflow-hidden bg-transparent max-md:h-72" aria-label="New and promo products">
        <div className="flex h-full w-max animate-product-marquee-reverse" style={{ animationDuration: `${Math.max(products.length * 3.75, 27)}s` }}>
          {[...products, ...products].map((product, productIndex) => {
            return (
            <Link key={`${product.id}-${productIndex}`} href={`/product/${product.slug}`} className="flex h-full w-[20vw] min-w-[20vw] shrink-0 flex-col items-center justify-center px-5 py-5 max-md:w-[50vw] max-md:min-w-[50vw]">
              <div className="relative h-[78%] w-full">
                <Image src={getProductImageUrl(product.mainImage, product.inStock, product.isNew, Boolean(product.isSold || (product.couponCode && product.couponPercent > 0)))} alt={product.title} fill sizes="20vw" className="object-contain" />
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PromotionWidget;
