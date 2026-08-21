"use client";
import { DashboardSidebar } from "@/components";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import { formatCategoryName } from "../../../../../utils/categoryFormating";
import { convertCategoryNameToURLFriendly } from "../../../../../utils/categoryFormating";
import apiClient from "@/lib/api";

interface DashboardSingleCategoryProps {
  params: Promise<{ id: string }>;
}

const DashboardSingleCategory = ({ params }: DashboardSingleCategoryProps) => {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [categoryInput, setCategoryInput] = useState<{ name: string }>({
    name: "",
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState(`/api/category-icon?categoryId=${id}`);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const updateCategory = async () => {
    const name = categoryInput.name.trim();

    if (name.length > 0 && !isSaving) {
      setIsSaving(true);
      try {
        const response = await apiClient.put(`/api/categories/${id}`, {
          name: convertCategoryNameToURLFriendly(name),
        });

        if (response.status === 200) {
          await response.json();

          if (iconFile) {
            const formData = new FormData();
            formData.append("icon", iconFile);
            const iconResponse = await fetch(`/api/category-icon?categoryId=${id}`, {
              method: "POST",
              body: formData,
            });

            if (!iconResponse.ok) {
              const errorData = await iconResponse.json();
              throw new Error(errorData.error || "Category icon upload failed");
            }

            setIconFile(null);
            setIconPreview(`/api/category-icon?categoryId=${id}&updated=${Date.now()}`);
          }

          toast.success("Category successfully updated");
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Error updating a category");
        }
      } catch (error) {
        console.error("Error updating category:", error);
        toast.error("There was an error while updating a category");
      } finally {
        setIsSaving(false);
      }
    } else {
      toast.error("For updating a category you must enter all values");
      return;
    }
  };

  useEffect(() => {
    // sending API request for getting single categroy
    apiClient
      .get(`/api/categories/${id}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCategoryInput({
          name: data?.name,
        });
      })
      .catch(() => {
        toast.error("This category no longer exists");
        router.push("/admin/categories");
      });
  }, [id]);

  const handleDeleteCategory = async () => {
    if (isDeleting || !window.confirm("Delete this category, its image, and all associated products?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await apiClient.delete(`/api/categories/${id}`);

      if (response.status === 204) {
        await fetch(`/api/category-icon?categoryId=${id}`, { method: "DELETE" });
        toast.success("Category deleted successfully");
        router.push("/admin/categories");
        return;
      }

      const errorData = await response.json();
      toast.error(errorData.error || "There was an error deleting category");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("There was an error deleting category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="flex flex-col gap-y-7 xl:pl-5 max-xl:px-5 w-full">
        <h1 className="text-3xl font-semibold">Category details</h1>
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Category name:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={formatCategoryName(categoryInput.name)}
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
            <img src={iconPreview} alt="Category icon preview" className="mb-3 h-32 w-32 object-contain" />
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              className="file-input file-input-bordered w-full"
              onChange={(event) => setIconFile(event.target.files?.[0] || null)}
            />
            <span className="label-text-alt mt-1">Choose a new PNG, JPG, JPEG, or SVG image. Maximum 2 MB.</span>
          </label>
        </div>

        <div className="flex gap-x-2 max-sm:flex-col">
          <button
            type="button"
            className="uppercase bg-blue-500 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2"
            onClick={updateCategory}
            disabled={isSaving || isDeleting}
          >
            {isSaving ? "Updating..." : "Update category"}
          </button>
          <button
            type="button"
            className="uppercase bg-red-600 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-red-700 hover:text-white focus:outline-none focus:ring-2"
            onClick={handleDeleteCategory}
            disabled={isSaving || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete category"}
          </button>
        </div>
        <p className="text-xl text-error max-sm:text-lg">
          Note: if you delete this category, you will delete all products
          associated with the category.
        </p>
      </div>
    </div>
  );
};

export default DashboardSingleCategory;
