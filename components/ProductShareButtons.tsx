"use client";

import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa6";
import { useEffect, useState } from "react";

type ProductShareButtonsProps = {
  title: string;
};

const ProductShareButtons = ({ title }: ProductShareButtonsProps) => {
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => setShareUrl(`${window.location.origin}${window.location.pathname}`), []);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const links = [
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: FaFacebook, className: "text-[#1877F2]" },
    { name: "Instagram", href: "https://www.instagram.com/", icon: FaInstagram, className: "text-[#E4405F]" },
    { name: "TikTok", href: `https://www.tiktok.com/share?url=${encodedUrl}&title=${encodedTitle}`, icon: FaTiktok, className: "text-black" },
  ];

  return (
    <div className="flex items-center gap-x-3" aria-label="Share this product">
      {links.map(({ name, href, icon: Icon, className }) => (
        <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${name}`} title={`Share on ${name}`} className={`text-2xl transition-opacity hover:opacity-70 ${className}`}>
          <Icon aria-hidden="true" />
        </a>
      ))}
    </div>
  );
};

export default ProductShareButtons;