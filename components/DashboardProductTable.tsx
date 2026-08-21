// *********************
// Role of the component: Product table component on admin dashboard page
// Name of the component: DashboardProductTable.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <DashboardProductTable />
// Input parameters: no input parameters
// Output: products table
// *********************

"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import CustomButton from "./CustomButton";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";
import { formatDZD } from "@/lib/currency";
import { getProductImageUrl } from "@/lib/product-image";

const DashboardProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/api/products?mode=admin", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Products could not be loaded");
      setProducts(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Products could not be loaded");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold text-center mb-5">All products</h1>
      <div className="flex justify-end mb-5">
        <Link href="/admin/products/new">
          <CustomButton
            buttonType="button"
            customWidth="110px"
            paddingX={10}
            paddingY={5}
            textSize="base"
            text="Add new product"
          />
        </Link>
      </div>

      <div className="xl:ml-5 w-full max-xl:mt-5 overflow-auto w-full h-[80vh]">
        <table className="table table-md table-pin-cols">
          {/* head */}
          <thead>
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <th>Product</th>
              <th>Stock Availability</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="py-10 text-center">Loading products...</td>
              </tr>
            )}
            {!isLoading && error && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-error">
                  <p>{error}</p>
                  <button type="button" className="btn btn-sm btn-outline mt-3" onClick={loadProducts}>Try again</button>
                </td>
              </tr>
            )}
            {!isLoading && !error && products.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center">No products found.</td>
              </tr>
            )}
            {!isLoading && !error && products.map((product) => (
                <tr key={product.id}>
                  <th>
                    <label>
                      <input type="checkbox" className="checkbox" />
                    </label>
                  </th>

                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="relative mask mask-squircle w-12 h-12">
                          <Image
                            width={48}
                            height={48}
                            src={getProductImageUrl(product?.mainImage, product?.inStock, product?.isNew, Boolean(product?.isSold || (product?.couponCode && Number(product?.couponPercent) > 0)))}
                            alt={sanitize(product?.title) || "Product image"}
                            className="h-full w-full object-contain"
                            onError={(event) => {
                              event.currentTarget.src = "/product_placeholder.jpg";
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{sanitize(product?.title)}</div>
                        <div className="text-sm opacity-50">
                          {sanitize(product?.manufacturer)}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    { product?.inStock ? (<span className="badge badge-success text-white badge-sm">
                      In stock
                    </span>) : (<span className="badge badge-error text-white badge-sm">
                      Out of stock
                    </span>) }
                    
                  </td>
                  <td>{formatDZD(product?.price)}</td>
                  <th>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="btn btn-ghost btn-xs"
                    >
                      details
                    </Link>
                  </th>
                </tr>
              ))}
          </tbody>
          {/* foot */}
          <tfoot>
            <tr>
              <th></th>
              <th>Product</th>
              <th>Stock Availability</th>
              <th>Price</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DashboardProductTable;
