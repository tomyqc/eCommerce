"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const data = await response.json();
      setProducts((Array.isArray(data) ? data : []).filter((product) => product.isNew || product.isSold || (product.couponCode && product.couponPercent > 0)));
    }).catch(() => undefined);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-2.5" aria-label="Promotions">
      <Heading title="New Products المنتوجات الجديدة" className="mt-5" />
      <div className="relative left-1/2 h-96 w-screen -translate-x-1/2 overflow-hidden bg-transparent max-md:h-72" aria-label="New and promo products">
        {(() => {
          const product = products[activeIndex % products.length];
          const isPromo = product.isSold || Boolean(product.couponCode && product.couponPercent > 0);
          return <Link key={`${product.id}-${activeIndex}`} href={`/product/${product.slug}`} onAnimationEnd={() => setActiveIndex((index) => (index + 1) % products.length)} className="animate-new-product-cycle absolute inset-0 mx-auto flex h-full w-full max-w-xl flex-col items-center justify-center px-5 py-5">
            <div className="relative h-[72%] w-full">
              <img src={getProductImageUrl(product.mainImage, product.inStock, product.isNew, Boolean(isPromo))} alt={product.title} className="h-full w-full bg-white object-contain" />
            </div>
            <div className="text-center text-black">
              <p className="text-lg font-semibold max-md:text-base">{product.title}</p>
              <p className="text-base max-md:text-sm">{product.price} DZD{isPromo ? " - Promo" : " - New"}</p>
            </div>
          </Link>;
        })()}
      </div>
    </section>
  );
};

export default PromotionWidget;
