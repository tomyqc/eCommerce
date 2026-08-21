"use client";
import { DashboardSidebar, StatsElement } from "@/components";
import { getProductImageUrl } from "@/lib/product-image";
import { formatDZD } from "@/lib/currency";
import apiClient from "@/lib/api";
import Image from "next/image";
import React, { useEffect, useState } from "react";

type DashboardOrder = { total: number; status: string };
type DashboardProduct = { id: string; title: string; mainImage: string; inStock: number; quantity: number };
type DashboardReview = { id: string; comment: string; user?: { email?: string } };

const AdminDashboardPage = () => {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<DashboardProduct[]>([]);
  const [reviews, setReviews] = useState<DashboardReview[]>([]);
  const [productIndex, setProductIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      const [ordersResponse, productsResponse, reviewsResponse] = await Promise.all([
        apiClient.get("/api/orders", { cache: "no-store" }),
        apiClient.get("/api/products", { cache: "no-store" }),
        fetch("/api/reviews", { cache: "no-store" }),
      ]);

      if (ordersResponse.ok) {
        const data = await ordersResponse.json();
        setOrders(Array.isArray(data?.orders) ? data.orders : []);
      }
      if (productsResponse.ok) {
        const data = await productsResponse.json();
        setOutOfStockProducts(
          (Array.isArray(data) ? data : []).filter((product) => Number(product.quantity ?? (product.inStock ? 1 : 0)) === 0),
        );
      }
      if (reviewsResponse.ok) {
        const data = await reviewsResponse.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    };

    loadDashboardData().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (outOfStockProducts.length < 2) return;
    const timer = window.setInterval(() => setProductIndex((index) => index + 1), 4000);
    return () => window.clearInterval(timer);
  }, [outOfStockProducts.length]);

  useEffect(() => {
    if (productIndex !== outOfStockProducts.length) return;
    const timer = window.setTimeout(() => setProductIndex(0), 1300);
    return () => window.clearTimeout(timer);
  }, [productIndex, outOfStockProducts.length]);

  useEffect(() => {
    if (reviews.length < 2) return;
    const timer = window.setInterval(() => setReviewIndex((index) => index + 1), 4550);
    return () => window.clearInterval(timer);
  }, [reviews.length]);

  useEffect(() => {
    if (reviewIndex !== reviews.length) return;
    const timer = window.setTimeout(() => setReviewIndex(0), 1300);
    return () => window.clearTimeout(timer);
  }, [reviewIndex, reviews.length]);

  const pendingOrders = orders.filter((order) => ["pending", "processing"].includes(order.status.toLowerCase())).length;
  const deliveredOrders = orders.filter((order) => order.status.toLowerCase() === "delivered").length;
  const totalRevenue = orders.reduce((total, order) => total + Number(order.total || 0), 0);
  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto max-xl:flex-col">
      <DashboardSidebar />
      <div className="flex flex-col items-center ml-5 gap-y-4 w-full max-xl:ml-0 max-xl:px-2 max-xl:mt-5 max-md:gap-y-1">
        <div className="grid w-full grid-cols-3 gap-3 max-md:grid-cols-1">
          <StatsElement title="Orders" value={`${orders.length} total`} detail={`${pendingOrders} pending • ${deliveredOrders} delivered`} />
          <StatsElement title="Revenue" value={formatDZD(totalRevenue)} detail="All sales" />
          <StatsElement title="Out of stock" value={`${outOfStockProducts.length} products`} detail="Inventory alert" />
        </div>
        <div className="relative h-40 w-full overflow-hidden bg-red-50 text-red-950" aria-label="Out of stock products">
          {outOfStockProducts.length > 0 ? <div className="flex h-full transition-transform duration-[1300ms] ease-in-out" style={{ transform: `translateX(-${productIndex * 100}%)` }}>
            {[...outOfStockProducts, ...outOfStockProducts].map((product, index) => (
              <div key={`${product.id}-${index}`} className="flex h-full w-full shrink-0 items-center justify-center gap-5 px-4">
                <Image src={getProductImageUrl(product.mainImage, 0)} alt={product.title} width={110} height={110} className="h-28 w-28 object-contain" onError={(event) => { event.currentTarget.src = `/${product.mainImage}`; }} />
                <div>
                  <h4 className="text-2xl font-semibold">Out of stock</h4>
                  <p className="text-lg">{product.title}</p>
                </div>
              </div>
            ))}
          </div> : <p className="flex h-full items-center justify-center text-xl">All products are in stock</p>}
        </div>
        <div className="relative h-40 w-full overflow-hidden bg-blue-500 text-white" aria-label="Customer comments">
          {reviews.length > 0 ? <div className="flex h-full transition-transform duration-[1300ms] ease-in-out" style={{ transform: `translateX(-${reviewIndex * 100}%)` }}>
            {[...reviews, ...reviews].map((review, index) => (
              <div key={`${review.id}-${index}`} className="flex h-full w-full shrink-0 flex-col items-center justify-center px-6 text-center" dir="rtl">
                <p className="max-w-3xl text-xl">“{review.comment}”</p>
                <p className="mt-2 text-sm text-blue-100">{review.user?.email || "Customer"}</p>
              </div>
            ))}
          </div> : <p className="flex h-full items-center justify-center text-xl">No customer comments yet</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
