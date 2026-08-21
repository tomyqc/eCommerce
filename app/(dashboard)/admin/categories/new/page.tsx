"use client";
import { DashboardSidebar } from "@/components";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { convertCategoryNameToURLFriendly } from "../../../../../utils/categoryFormating";
import apiClient from "@/lib/api";

const DashboardNewCategoryPage = () => {
  const [categoryInput, setCategoryInput] = useState({
    name: "",
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const addNewCategory = async () => {
    const name = categoryInput.name.trim();

    if (name.length > 0 && !isSaving) {
      setIsSaving(true);
      try {
        const response = await apiClient.post(`/api/categories`, {
          name: convertCategoryNameToURLFriendly(name),
        });

        if (response.status === 201) {
          const category = await response.json();

          if (iconFile) {
            const formData = new FormData();
            formData.append("icon", iconFile);
            const iconResponse = await fetch(`/api/category-icon?categoryId=${category.id}`, {
              method: "POST",
              body: formData,
            });

            if (!iconResponse.ok) {
              const errorData = await iconResponse.json();
              throw new Error(errorData.error || "Category icon upload failed");
            }
          }

          toast.success("Category added successfully");
          setCategoryInput({
            name: "",
          });
          setIconFile(null);
        } else {
          const errorData = await response.json();
          toast.error(
            errorData.error || "There was an error while creating category"
          );
        }
      } catch (error) {
        console.error("Error creating category:", error);
        toast.error("There was an error while creating category");
      } finally {
        setIsSaving(false);
      }
    } else {
      toast.error("You need to enter values to add a category");
    }
  };
  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="flex flex-col gap-y-7 xl:pl-5 max-xl:px-5 w-full">
        <h1 className="text-3xl font-semibold">Add new category</h1>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Category name:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={categoryInput.name}
              onChange={(e) =>
                setCategoryInput({ ...categoryInput, name: e.target.value })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-sm">
            <div className="label">
              <span className="label-text">Category image:</span>
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              className="file-input file-input-bordered w-full"
              onChange={(event) => setIconFile(event.target.files?.[0] || null)}
            />
            <span className="label-text-alt mt-1">PNG, JPG, JPEG, or SVG. Maximum 2 MB.</span>
          </label>
        </div>

        <div className="flex gap-x-2">
          <button
            type="button"
            className="uppercase bg-blue-500 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2"
            onClick={addNewCategory}
            disabled={isSaving}
          >
            {isSaving ? "Creating..." : "Create category"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardNewCategoryPage;
