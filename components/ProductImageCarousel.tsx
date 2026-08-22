"use client";

import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import apiClient from "@/lib/api";
import { getProductImageUrl } from "@/lib/product-image";

type ProductImageCarouselProps = {
  productId?: string;
  mainImage?: string;
  title: string;
  className?: string;
  imageClassName?: string;
};

type ProductImage = {
  imageID: string;
  image: string;
};

const ProductImageCarousel = ({
  productId,
  mainImage,
  title,
  className = "h-80 w-full",
  imageClassName = "h-full w-full object-contain",
}: ProductImageCarouselProps) => {
  const [images, setImages] = useState<string[]>(mainImage ? [mainImage] : []);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setImages(mainImage ? [mainImage] : []);
    setCurrentIndex(0);

    if (!productId) return;
    let active = true;
    apiClient.get(`/api/images/${productId}`, { cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const relatedImages: ProductImage[] = await response.json();
      if (!active) return;
      setImages([
        ...(mainImage ? [mainImage] : []),
        ...relatedImages.map((item) => item.image),
      ].filter((image, index, allImages) => allImages.indexOf(image) === index).slice(0, 5));
    }).catch(() => undefined);

    return () => {
      active = false;
    };
  }, [productId, mainImage]);

  if (images.length === 0) {
    return <div className={className} />;
  }

  const showPrevious = () => setCurrentIndex((index) => (index - 1 + images.length) % images.length);
  const showNext = () => setCurrentIndex((index) => (index + 1) % images.length);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <div className="relative min-h-0 w-full flex-1">
        <img
          src={getProductImageUrl(images[currentIndex])}
          alt={`${title} photo ${currentIndex + 1}`}
          className={imageClassName}
          onError={(event) => {
            event.currentTarget.src = "/product_placeholder.jpg";
          }}
        />
        {images.length > 1 && (
          <>
            <button type="button" aria-label="Previous product photo" onClick={showPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow hover:bg-white">
              <FaChevronLeft aria-hidden="true" />
            </button>
            <button type="button" aria-label="Next product photo" onClick={showNext} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-black shadow hover:bg-white">
              <FaChevronRight aria-hidden="true" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex shrink-0 items-center gap-2 pt-2" aria-label={`${images.length} product photos`}>
          {images.map((image, index) => (
            <span key={`${image}-${index}`} aria-label={`Product photo ${index + 1}`} aria-current={index === currentIndex} className={`h-2 w-2 rounded-full ${index === currentIndex ? "bg-black" : "bg-gray-300"}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageCarousel;
