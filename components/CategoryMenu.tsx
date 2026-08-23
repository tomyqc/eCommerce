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
import apiClient from "@/lib/api";
import CategoryCarousel from "./CategoryCarousel";

const CategoryMenu = async () => {
  let categories: Category[] = [];
  try {
    const response = await apiClient.get("/api/categories");
    if (response.ok) {
      const data = await response.json();
      categories = Array.isArray(data) ? data : [];
    }
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
