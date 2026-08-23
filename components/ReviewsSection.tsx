"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Heading from "./Heading";
import toast from "react-hot-toast";

type Review = {
  id: string;
  comment: string;
  createdAt: string;
  user: { email: string };
};

const featuredReviews = [
  {
    stars: 5,
    comment: "منتجات ممتازة وصلتني بسرعة وبحالة جيدة، وسأتعامل مع المتجر مرة أخرى.",
    name: "د. سارة",
  },
  {
    stars: 4,
    comment: "تجربة شراء سهلة، والمستلزمات مطابقة للوصف وخدمة العملاء متعاونة.",
    name: "أحمد",
  },
  {
    stars: 3,
    comment: "المنتجات جيدة والتوصيل موثوق، وأتمنى إضافة خيارات أكثر مستقبلاً.",
    name: "د. لينا",
  },
];

const ReviewsSection = () => {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const loadReviews = async () => {
    const response = await fetch("/api/reviews", { cache: "no-store" });
    if (response.ok) setReviews(await response.json());
  };

  useEffect(() => {
    loadReviews().catch(() => undefined);
  }, []);

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setFeaturedIndex((currentIndex) => currentIndex + 1);
    }, 4550);

    return () => window.clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    if (featuredIndex !== featuredReviews.length) return;

    const resetTimer = window.setTimeout(() => setFeaturedIndex(0), 1300);
    return () => window.clearTimeout(resetTimer);
  }, [featuredIndex]);

  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر إضافة التعليق");
      setReviews((currentReviews) => [data, ...currentReviews]);
      setComment("");
      toast.success("تمت إضافة تعليقك");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إضافة التعليق");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteReview = async (id: string) => {
    const response = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
    if (response.ok) {
      setReviews((currentReviews) => currentReviews.filter((review) => review.id !== id));
      toast.success("تم حذف التعليق");
    } else {
      toast.error("تعذر حذف التعليق");
    }
  };

  return (
    <section className="bg-transparent px-6 py-8" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-screen-2xl">
        <Heading title="آراء العملاء وتعليقاتهم" />
        <div className="mt-5 grid grid-cols-3 gap-6 max-lg:grid-cols-1" dir="rtl">
          {reviews.map((review) => (
            <article key={review.id} className="border border-gray-200 bg-transparent px-6 py-7 text-right shadow-sm">
              <div className="text-xl tracking-widest text-blue-600" aria-label="5 من 5 نجوم">★★★★★</div>
              <p className="mt-4 text-base leading-7 text-gray-700">“{review.comment}”</p>
              <p className="mt-5 font-semibold text-black">{review.user.email}</p>
              {isAdmin && (
                <button type="button" onClick={() => deleteReview(review.id)} className="mt-4 text-sm font-semibold text-red-600 hover:text-red-800">
                  حذف التعليق
                </button>
              )}
            </article>
          ))}
        </div>
        <div className="relative left-1/2 mt-5 h-52 w-screen -translate-x-1/2 overflow-hidden bg-transparent max-md:h-60" aria-label="آراء مميزة">
          <div
            className={`flex h-full ${featuredIndex < featuredReviews.length ? "transition-transform duration-[1300ms] ease-in-out" : ""}`}
            style={{ transform: `translateX(-${featuredIndex * 100}vw)` }}
          >
            {[...featuredReviews, ...featuredReviews].map((review, index) => (
              <article key={`${review.name}-${index}`} className="flex h-full w-screen shrink-0 flex-col items-center justify-center px-8 text-center" dir="rtl">
                <div className="text-xl tracking-widest text-blue-600" aria-label={`${review.stars} من 5 نجوم`}>
                  {"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}
                </div>
                <p className="mt-3 max-w-2xl text-base leading-7 text-gray-700">“{review.comment}”</p>
                <p className="mt-2 font-semibold text-black">{review.name}</p>
              </article>
            ))}
          </div>
        </div>
        <form onSubmit={submitReview} className="mx-auto mt-5 max-w-2xl" dir="rtl">
          <label htmlFor="review-comment" className="mb-2 block text-right font-semibold text-black">أضف تعليقك</label>
          <textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="اكتب تجربتك معنا" maxLength={1000} className="textarea textarea-bordered min-h-28 w-full text-right" required />
          <button type="submit" disabled={isSubmitting || !session} className="mt-1.5 bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            {!session ? "سجل الدخول لإضافة تعليق" : isSubmitting ? "جار الإرسال..." : "إرسال التعليق"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ReviewsSection;
