"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import Heading from "@/components/Heading";

type PromotionProduct = {
  id: string;
  slug: string;
  title: string;
  mainImage: string;
  inStock: number;
  isNew: boolean;
  isSold: boolean;
  couponCode?: string | null;
  couponPercent: number;
};
type PubPhoto = { slot: string; image: string };

const PromotionWidget = () => {
  const [products, setProducts] = useState<PromotionProduct[]>([]);
  const [pubPhotos, setPubPhotos] = useState<PubPhoto[]>([]);

  useEffect(() => {
    apiClient.get("/api/products", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const data = await response.json();
      setProducts((Array.isArray(data) ? data : []).filter((product) => product.isNew || product.isSold || (product.couponCode && product.couponPercent > 0)));
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    fetch("/api/pubs", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : [])
      .then((data: PubPhoto[]) => setPubPhotos(Array.isArray(data) ? data : []))
      .catch(() => undefined);
  }, []);

  if (products.length === 0 || pubPhotos.length === 0) return null;

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-5" aria-label="Promotions">
      <Heading title="New Products المنتوجات الجديدة" className="mt-10" />
      <div className="relative left-1/2 h-96 w-screen -translate-x-1/2 overflow-hidden bg-transparent max-md:h-72" aria-label="New and promo products">
        <div className="flex h-full w-max animate-product-marquee-reverse" style={{ animationDuration: `${Math.max(products.length * 3.75, 27)}s` }}>
          {[...pubPhotos, ...pubPhotos].map((pub, photoIndex) => {
            const product = products[photoIndex % products.length];
            return (
            <Link key={`${pub.slot}-${photoIndex}`} href={product ? `/product/${product.slug}` : "/shop"} className="flex h-full w-[20vw] min-w-[20vw] shrink-0 flex-col items-center justify-center px-[4.125rem] py-5 max-md:w-[50vw] max-md:min-w-[50vw] max-md:px-[4.125rem]">
              <div className="relative h-[78%] w-full">
                <Image src={pub.image} alt="New or promo product" fill sizes="20vw" className="scale-150 object-contain" />
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
