"use client";

import Link from "next/link";
import { useState } from "react";
import { FaChevronRight } from "react-icons/fa6";
import { formatCategoryName } from "@/utils/categoryFormating";

type Category = {
  id: string;
  name: string;
};

const getCategoryLabels = (name: string) => {
  try {
    name = decodeURIComponent(name);
  } catch {
    // Keep the original category name when it is not valid URL encoding.
  }
  const arabicStart = name.search(/[\u0600-\u06ff]/u);
  if (arabicStart === -1) {
    return { english: formatCategoryName(name), arabic: "" };
  }

  const english = formatCategoryName(name.slice(0, arabicStart).replace(/-+$/u, "")).trim();
  const arabic = name.slice(arabicStart).replace(/-/g, " ").trim();
  return { english, arabic };
};

const CategoryCarousel = ({ categories }: { categories: Category[] }) => {
  const [startIndex, setStartIndex] = useState(0);
  const maxStartIndex = Math.max(categories.length - 3, 0);

  return (
    <div className="relative mx-auto max-w-screen-2xl px-16 py-10 max-md:px-8">
      <div className="overflow-hidden" aria-label="Browse categories">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            width: `${Math.max(categories.length / 3, 1) * 100}%`,
            transform: categories.length > 0
              ? `translateX(-${startIndex * (100 / categories.length)}%)`
              : "none",
          }}
        >
          {categories.map((category) => {
            const labels = getCategoryLabels(category.name);
            return (
              <Link
                href={`/shop/${encodeURIComponent(category.name)}`}
                key={category.id}
                className="min-w-0 px-2"
                style={{ flex: `0 0 ${100 / categories.length}%` }}
              >
                <div className="flex min-h-[220px] flex-col items-center justify-center gap-y-2 bg-transparent py-4 text-black transition hover:bg-black/5">
                  <img
                    src={`/api/category-icon?categoryId=${category.id}`}
                    width="147"
                    height="147"
                    alt={category.name}
                    className="h-[clamp(90px,12vw,147px)] w-[clamp(90px,12vw,147px)] object-contain"
                  />
                  <h3 className="text-center text-sm font-semibold leading-tight max-md:text-xs">
                    <span className="block">{labels.english}</span>
                    {labels.arabic && <span dir="rtl" className="mt-0.5 block text-xs font-medium">{labels.arabic}</span>}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      {categories.length > 3 && (
        <button
          type="button"
          aria-label="Show previous categories"
          title="Show previous categories"
          disabled={startIndex === 0}
          onClick={() => setStartIndex((current) => Math.max(current - 1, 0))}
          className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white text-black shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 max-md:left-0"
        >
          <FaChevronRight className="rotate-180" aria-hidden="true" />
        </button>
      )}
      {categories.length > 3 && (
        <button
          type="button"
          aria-label="Show next categories"
          title="Show next categories"
          disabled={startIndex >= maxStartIndex}
          onClick={() => setStartIndex((current) => Math.min(current + 1, maxStartIndex))}
          className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white text-black shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 max-md:right-0"
        >
          <FaChevronRight aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default CategoryCarousel;
