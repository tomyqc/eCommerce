"use client";

import { useEffect, useState } from "react";
import Heading from "@/components/Heading";

type Announcement = { id: string; title: string | null; media: string; mediaType: "image" | "video" };

export default function AnnouncementsWidget() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch("/api/announcements", { cache: "no-store" }).then((response) => response.ok ? response.json() : []).then((data) => setItems(Array.isArray(data) ? data : [])).catch(() => undefined);
  }, []);

  if (!items.length) return null;
  const item = items[activeIndex % items.length];
  return <section className="mx-auto max-w-screen-2xl px-4 py-5" aria-label="Announcements">
    <Heading title="Announcements" className="mt-6" />
    <div className="relative left-1/2 h-96 w-screen -translate-x-1/2 overflow-hidden bg-transparent max-md:h-72">
      <div key={`${item.id}-${activeIndex}`} className="animate-new-product-cycle absolute inset-0 flex flex-col items-center justify-center" onAnimationEnd={() => setActiveIndex((index) => (index + 1) % items.length)}>
        {item.mediaType === "video" ? <video src={item.media} className="h-[78%] max-w-full object-contain" autoPlay muted loop playsInline controls /> : <img src={item.media} alt={item.title || "Announcement"} className="h-[78%] max-w-full object-contain" />}
        {item.title && <p className="text-center text-lg font-semibold text-black">{item.title}</p>}
      </div>
    </div>
  </section>;
}