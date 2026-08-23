// *********************
// Role of the component: Footer component
// Name of the component: Footer.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <Footer />
// Input parameters: no input parameters
// Output: Footer component
// *********************

"use client";

import Link from "next/link";
import { bottomPageSectionLabels } from "@/lib/bottom-page-config";
import React, { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";
import { FaAndroid } from "react-icons/fa";

type FooterPage = {
  id: string;
  section: "sale" | "about" | "buying" | "support";
  label: string;
  slug: string;
};

const Footer = () => {
  const [pages, setPages] = useState<FooterPage[]>([]);

  useEffect(() => {
    fetch("/api/bottom-pages", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Footer pages could not be loaded");
        const data = await response.json();
        setPages(Array.isArray(data) ? data : []);
      })
      .catch(() => setPages([]));
  }, []);

  return (
    <footer className="bg-transparent" aria-labelledby="footer-heading">
      <div>
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-screen-2xl px-6 pb-7 pt-12 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-4">
            <div className="text-left">
              <p className="text-4xl font-extrabold text-black">Aiden Store</p>
              <p className="mt-3 text-lg font-semibold text-black">
                Professional Dental &amp; Cosmetic Supplies.
              </p>
            </div>
            <div dir="rtl" className="mt-8 text-right text-lg font-semibold text-black xl:mt-0">
              مستلزمات طب الأسنان باحترافية. جودة تثق بها. تصلك أينما كنت.
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-lg font-bold leading-6 text-blue-600">
                    {bottomPageSectionLabels.sale}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {pages.filter((item) => item.section === "sale").map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/bottom-page/${item.slug}`}
                          className="text-sm leading-6 text-black hover:text-gray-700"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-base font-bold leading-6 text-blue-600">
                    {bottomPageSectionLabels.about}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {pages.filter((item) => item.section === "about").map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/bottom-page/${item.slug}`}
                          className="text-sm leading-6 text-black hover:text-gray-700"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-base font-bold leading-6 text-blue-600">
                    {bottomPageSectionLabels.buying}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {pages.filter((item) => item.section === "buying").map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/bottom-page/${item.slug}`}
                          className="text-sm leading-6 text-black hover:text-gray-700"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-base font-bold leading-6 text-blue-600">
                    {bottomPageSectionLabels.support}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {pages.filter((item) => item.section === "support").map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/bottom-page/${item.slug}`}
                          className="text-sm leading-6 text-black hover:text-gray-700"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-7 flex items-center justify-center gap-6 border-t border-gray-200 pt-5" aria-label="Social media links">
            <a href="https://www.facebook.com/aiden.dentaire" target="_blank" rel="noreferrer" aria-label="Aiden Store on Facebook" title="Facebook" className="text-2xl text-black transition hover:text-blue-600">
              <FaFacebookF aria-hidden="true" />
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Aiden Store on Instagram" title="Instagram" className="text-2xl text-black transition hover:text-pink-600">
              <FaInstagram aria-hidden="true" />
            </a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer" aria-label="Aiden Store on TikTok" title="TikTok" className="text-2xl text-black transition hover:text-gray-600">
              <FaTiktok aria-hidden="true" />
            </a>
            <a href="/aiden-store.apk" download aria-label="Download the Aiden Store Android app" title="Download Android app" className="text-2xl text-green-600 transition hover:text-green-800">
              <FaAndroid aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
