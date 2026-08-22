"use client";
import { CustomButton, DashboardSidebar, SectionTitle } from "@/components";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import toast from "react-hot-toast";
import {
  convertCategoryNameToURLFriendly as convertSlugToURLFriendly,
  formatCategoryName,
} from "../../../../../utils/categoryFormating";
import apiClient from "@/lib/api";
import { getProductImageUrl } from "@/lib/product-image";

const COLOR_OPTIONS = ["أسود", "أبيض", "أخضر", "أصفر", "أحمر", "أزرق", "رمادي", "شفاف", "وردي"];

interface DashboardProductDetailsProps {
  params: Promise<{ id: string }>;
}

const DashboardProductDetails = ({ params }: DashboardProductDetailsProps) => {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [product, setProduct] = useState<Product>();
  const [categories, setCategories] = useState<Category[]>();
  const [otherImages, setOtherImages] = useState<OtherImages[]>([]);
  const [otherColor, setOtherColor] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const router = useRouter();

  // functionality for deleting product
  const deleteProduct = async () => {
    const requestOptions = {
      method: "DELETE",
    };
    apiClient
      .delete(`/api/products/${id}`, requestOptions)
      .then((response) => {
        if (response.status !== 204) {
          if (response.status === 400) {
            toast.error(
              "Cannot delete the product because of foreign key constraint"
            );
          } else {
            throw Error("There was an error while deleting product");
          }
        } else {
          toast.success("Product deleted successfully");
          router.push("/admin/products");
        }
      })
      .catch((error) => {
        toast.error("There was an error while deleting product");
      });
  };

  // functionality for updating product
  const updateProduct = async () => {
    if (!product) return;

    if (!product.title.trim() || !product.slug.trim() || !product.manufacturer.trim() || !product.description.trim()) {
      toast.error("You need to enter values in input fields");
      return;
    }

    if (!Number.isFinite(Number(product.price)) || Number(product.price) < 0) {
      toast.error("Please enter a valid product price");
      return;
    }

    try {
      const response = await apiClient.put(`/api/products/${id}`, {
        merchantId: product.merchantId,
        title: product.title.trim(),
        slug: product.slug.trim(),
        price: Number(product.price),
        manufacturer: product.manufacturer.trim(),
        size: product.size?.trim() || null,
        color: product.color?.trim() || null,
        description: product.description.trim(),
        categoryId: product.categoryId,
        mainImage: product.mainImage,
        rating: product.rating,
        inStock: Number(product.inStock),
        quantity: Math.max(0, Math.floor(Number(product.quantity))),
        isNew: Boolean(product.isNew),
        isSold: Boolean(product.isSold),
        couponCode: product.couponCode || null,
        couponPercent: Math.max(0, Math.min(100, Math.floor(Number(product.couponPercent || 0)))),
      });

      if (response.status === 200) {
        const savedProduct = await response.json();
        setProduct(savedProduct);
        toast.success("Product successfully updated");
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || "There was an error while updating product"
        );
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("There was an error while updating product");
    }
  };

  // functionality for uploading main image file
  const uploadFile = async (file: any) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);

    try {
      const response = await apiClient.post("/api/main-image", formData);

      if (response.ok) {
        const data = await response.json();
        setProduct((currentProduct) => currentProduct ? {
          ...currentProduct,
          mainImage: data.fileName || currentProduct.mainImage,
        } : currentProduct);
      } else {
        toast.error("File upload unsuccessful.");
      }
    } catch (error) {
      console.error("There was an error while during request sending:", error);
      toast.error("There was an error during request sending");
    }
  };

  const uploadAdditionalImage = async (file: File) => {
    if (otherImages.length >= 4) {
      toast.error("A product can have a maximum of 5 photos including its main photo");
      return;
    }
    const formData = new FormData();
    formData.append("uploadedFile", file);
    const uploadResponse = await apiClient.post("/api/main-image", formData);
    if (!uploadResponse.ok) throw new Error("Photo upload unsuccessful");
    const { fileName } = await uploadResponse.json();
    const image = `${apiClient.baseUrl}/media/${fileName}`;
    const createResponse = await apiClient.post("/api/images", { productID: id, image });
    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(error.error || "Photo could not be added");
    }
    const createdImage = await createResponse.json();
    setOtherImages((current) => [...current, createdImage]);
  };

  const replaceAdditionalImage = async (imageID: string, file: File) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);
    const uploadResponse = await apiClient.post("/api/main-image", formData);
    if (!uploadResponse.ok) throw new Error("Photo upload unsuccessful");
    const { fileName } = await uploadResponse.json();
    const image = `${apiClient.baseUrl}/media/${fileName}`;
    const response = await apiClient.put(`/api/images/photo/${imageID}`, { image });
    if (!response.ok) throw new Error("Photo could not be replaced");
    const updated = await response.json();
    setOtherImages((current) => current.map((item) => item.imageID === imageID ? updated : item));
  };

  const removeAdditionalImage = async (imageID: string) => {
    const response = await apiClient.delete(`/api/images/photo/${imageID}`);
    if (!response.ok) throw new Error("Photo could not be deleted");
    setOtherImages((current) => current.filter((item) => item.imageID !== imageID));
  };

  // fetching main product data including other product images
  const fetchProductData = async () => {
    try {
      const [productResponse, imagesResponse] = await Promise.all([
        apiClient.get(`/api/products/${id}`, { cache: "no-store" }),
        apiClient.get(`/api/images/${id}`, { cache: "no-store" }),
      ]);
      const productData = await productResponse.json();
      const images = await imagesResponse.json();
      if (!productResponse.ok) throw new Error(productData.error || "Product could not be loaded");
      if (!imagesResponse.ok) throw new Error(images.error || "Product images could not be loaded");
      setProduct(productData);
      setOtherImages(Array.isArray(images) ? images : []);
      const savedColors = String(productData.color || "").split(",").map((color) => color.trim()).filter(Boolean);
      setSelectedColors(savedColors.filter((color) => COLOR_OPTIONS.includes(color)));
      setOtherColor(savedColors.filter((color) => !COLOR_OPTIONS.includes(color)).join(", "));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Product could not be loaded");
    }
  };

  // fetching all product categories. It will be used for displaying categories in select category input
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get(`/api/categories`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Categories could not be loaded");
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Categories could not be loaded");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProductData();
  }, [id]);

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="flex flex-col gap-y-7 xl:ml-5 w-full max-xl:px-5">
        <h1 className="text-3xl font-semibold">Product details</h1>
        {/* Product name input div - start */}
        
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product name:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.title || ""}
              onChange={(e) =>
                setProduct({ ...product!, title: e.target.value })
              }
            />
          </label>
        </div>
        {/* Product name input div - end */}
        {/* Product price input div - start */}

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Product price:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.price || ""}
              onChange={(e) =>
                setProduct({ ...product!, price: Number(e.target.value) })
              }
            />
          </label>
        </div>
        {/* Product price input div - end */}
        {/* Product manufacturer input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Manufacturer:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={product?.manufacturer || ""}
              onChange={(e) =>
                setProduct({ ...product!, manufacturer: e.target.value })
              }
            />
          </label>
        </div>
        {/* Product manufacturer input div - end */}
        {/* Product slug input div - start */}

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Slug:</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full max-w-xs"
              value={
                product?.slug ? convertSlugToURLFriendly(product?.slug) : ""
              }
              onChange={(e) =>
                setProduct({
                  ...product!,
                  slug: convertSlugToURLFriendly(e.target.value),
                })
              }
            />
          </label>
        </div>
        {/* Product slug input div - end */}
        {/* Product inStock select input div - start */}

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Available quantity:</span>
            </div>
            <input
              type="number"
              min="0"
              step="1"
              className="input input-bordered w-full max-w-xs"
              value={product?.quantity ?? 0}
              onChange={(e) =>
                setProduct({ ...product!, quantity: Math.max(0, Math.floor(Number(e.target.value))) })
              }
            />
          </label>
        </div>

        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Is product in stock?</span>
            </div>
            <select
              className="select select-bordered"
              value={Number(product?.quantity ?? 0) > 0 ? "in" : "out"}
              onChange={(e) => setProduct({ ...product!, quantity: e.target.value === "out" ? 0 : Math.max(1, Number(product?.quantity ?? 0)) })}
            >
              <option value="in">In stock</option>
              <option value="out">Out of stock</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="label cursor-pointer gap-3">
            <span className="label-text">New product</span>
            <input type="checkbox" className="toggle toggle-primary" checked={Boolean(product?.isNew)} onChange={(e) => setProduct({ ...product!, isNew: e.target.checked })} />
          </label>
          <label className="label cursor-pointer gap-3">
            <span className="label-text">Promo</span>
            <input type="checkbox" className="toggle toggle-primary" checked={Boolean(product?.isSold)} onChange={(e) => setProduct({ ...product!, isSold: e.target.checked })} />
          </label>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="form-control w-full max-w-xs">
            <span className="label-text">Coupon code</span>
            <input type="text" className="input input-bordered" value={product?.couponCode || ""} onChange={(e) => setProduct({ ...product!, couponCode: e.target.value.toUpperCase() })} placeholder="WELCOME10" />
          </label>
          <label className="form-control w-40">
            <span className="label-text">Discount %</span>
            <input type="number" min="0" max="100" className="input input-bordered" value={product?.couponPercent ?? 0} onChange={(e) => setProduct({ ...product!, couponPercent: Number(e.target.value) })} />
          </label>
        </div>
        {/* Product inStock select input div - end */}
        {/* Product category select input div - start */}
        <div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Category:</span>
            </div>
            <select
              className="select select-bordered"
              value={product?.categoryId || ""}
              onChange={(e) =>
                setProduct({
                  ...product!,
                  categoryId: e.target.value,
                })
              }
            >
              {categories &&
                categories.map((category: Category) => (
                  <option key={category?.id} value={category?.id}>
                    {formatCategoryName(category?.name)}
                  </option>
                ))}
            </select>
          </label>
        </div>
        {/* Product category select input div - end */}

        <div className="flex flex-wrap gap-4">
          <label className="form-control w-full max-w-xs">
            <span className="label-text">Size:</span>
            <input type="text" className="input input-bordered" value={product?.size || ""} placeholder="S, XL, 1000 g, 2 kg" onChange={(e) => setProduct({ ...product!, size: e.target.value })} />
          </label>
          <label className="form-control w-full max-w-xs">
            <span className="label-text">Color:</span>
            <div className="grid grid-cols-2 gap-2 rounded border border-gray-300 p-3">
              {COLOR_OPTIONS.map((color) => <label key={color} className="flex items-center gap-2"><input type="checkbox" className="checkbox checkbox-sm" checked={selectedColors.includes(color)} onChange={(e) => { const values = e.target.checked ? [...selectedColors, color] : selectedColors.filter((item) => item !== color); setSelectedColors(values); setProduct({ ...product!, color: [...values, ...(otherColor ? [otherColor] : [])].join(", ") }); }} /><span>{color}</span></label>)}
            </div>
            <input type="text" className="input input-bordered mt-2" value={otherColor} placeholder="Other color (optional)" onChange={(e) => { setOtherColor(e.target.value); setProduct({ ...product!, color: [...selectedColors, ...(e.target.value ? [e.target.value] : [])].join(", ") }); }} />
          </label>
        </div>

        {/* Main image file upload div - start */}
        <div>
          <input
            type="file"
            className="file-input file-input-bordered file-input-lg w-full max-w-sm"
            onChange={(e) => {
              // @ts-ignore
              const selectedFile = e.target.files[0];

              if (selectedFile) {
                uploadFile(selectedFile);
              }
            }}
          />
          {product?.mainImage && (
            <div className="relative mt-2 w-fit">
              <Image
                src={getProductImageUrl(product?.mainImage, product?.inStock, product?.isNew, Boolean(product?.isSold || (product?.couponCode && Number(product?.couponPercent) > 0)))}
                alt={product?.title}
                className="w-auto h-auto"
                width={100}
                height={100}
              />
            </div>
          )}
        </div>
        {/* Main image file upload div - end */}
        {/* Other images file upload div - start */}
        <div>
          <div className="flex flex-wrap gap-3">
          {otherImages &&
            otherImages.map((image) => (
              <div key={image.imageID} className="flex flex-col gap-2">
                <Image src={getProductImageUrl(image.image)} alt="product image" width={100} height={100} className="h-24 w-24 object-contain" />
                <label className="btn btn-sm">Replace<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && replaceAdditionalImage(image.imageID, e.target.files[0]).catch((error) => toast.error(error.message))} /></label>
                <button type="button" className="btn btn-error btn-sm text-white" onClick={() => removeAdditionalImage(image.imageID).catch((error) => toast.error(error.message))}>Delete</button>
              </div>
            ))}
          </div>
          {otherImages.length < 4 && <label className="btn btn-outline mt-3">Add photo<input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAdditionalImage(e.target.files[0]).catch((error) => toast.error(error.message))} /></label>}
          <p className="mt-2 text-sm text-gray-600">{otherImages.length + (product?.mainImage ? 1 : 0)}/5 photos</p>
        </div>
        {/* Other images file upload div - end */}
        {/* Product description div - start */}
        <div>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Product description:</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-24"
              value={product?.description || ""}
              onChange={(e) =>
                setProduct({ ...product!, description: e.target.value })
              }
            ></textarea>
          </label>
        </div>
        {/* Product description div - end */}
        {/* Action buttons div - start */}
        <div className="flex gap-x-2 max-sm:flex-col">
          <button
            type="button"
            onClick={updateProduct}
            className="uppercase bg-blue-500 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2"
          >
            Update product
          </button>
          <button
            type="button"
            className="uppercase bg-red-600 px-10 py-5 text-lg border border-black border-gray-300 font-bold text-white shadow-sm hover:bg-red-700 hover:text-white focus:outline-none focus:ring-2"
            onClick={deleteProduct}
          >
            Delete product
          </button>
        </div>
        {/* Action buttons div - end */}
        <p className="text-xl max-sm:text-lg text-error">
          To delete the product you first need to delete all its records in
          orders (customer_order_product table).
        </p>
      </div>
    </div>
  );
};

export default DashboardProductDetails;
