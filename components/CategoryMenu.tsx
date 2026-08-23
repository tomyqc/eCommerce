// *********************
// Role of the component: Category wrapper that will contain title and category items
// Name of the component: CategoryMenu.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <CategoryMenu />
// Input parameters: no input parameters
// Output: section title and category items
// *********************

import React from "react";
import Heading from "./Heading";
import CategoryCarousel from "./CategoryCarousel";
import prisma from "@/utils/db";

const CategoryMenu = async () => {
  let categories: Category[] = [];
  try {
    categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch {
    categories = [];
  }

  return (
    <div className="bg-transparent py-2.5">
      <Heading title="Categories الفئات" className="mt-5" />
      <CategoryCarousel categories={categories} />
    </div>
  );
};

export default CategoryMenu;
