import prisma from "@/utils/db";
import { bottomPageSections } from "@/lib/bottom-page-config";

const defaultBottomPages = [
  { section: "sale", label: "Discounts", slug: "discounts", title: "Discounts", content: "Discover our latest discounts and special offers." },
  { section: "sale", label: "News", slug: "news", title: "News", content: "Read the latest news from Aiden Store." },
  { section: "sale", label: "Register Discounts", slug: "register-discounts", title: "Register Discounts", content: "Create an account to hear about exclusive discounts." },
  { section: "about", label: "About Aiden Store", slug: "about-aiden-store", title: "About Aiden Store", content: "Aiden Store provides professional dental and cosmetic supplies with dependable service." },
  { section: "about", label: "Work With Us", slug: "work-with-us", title: "Work With Us", content: "Contact our team to learn about opportunities with Aiden Store." },
  { section: "about", label: "Company Profile", slug: "company-profile", title: "Company Profile", content: "Learn more about our products, values, and service." },
  { section: "buying", label: "Loyalty Card", slug: "loyalty-card", title: "Loyalty Card", content: "Learn how our loyalty program works." },
  { section: "buying", label: "Terms Of Use", slug: "terms-of-use", title: "Terms Of Use", content: "Review the terms that apply to using Aiden Store." },
  { section: "buying", label: "Privacy Policy", slug: "privacy-policy", title: "Privacy Policy", content: "Read how Aiden Store handles your information." },
  { section: "buying", label: "Complaints", slug: "complaints", title: "Complaints", content: "Contact us if you need help resolving an issue." },
  { section: "buying", label: "Partners", slug: "partners", title: "Partners", content: "Learn about partnering with Aiden Store." },
  { section: "support", label: "Contact", slug: "contact", title: "Contact", content: "Contact our support team for help with your order." },
  { section: "support", label: "How to Buy", slug: "how-to-buy", title: "How to Buy", content: "Browse products, add them to your cart, and complete checkout." },
  { section: "support", label: "FAQ", slug: "faq", title: "FAQ", content: "Find answers to frequently asked questions." },
] as const;

export async function getBottomPages() {
  const count = await prisma.bottomPage.count();
  if (count === 0) {
    await prisma.bottomPage.createMany({ data: [...defaultBottomPages] });
  }

  return prisma.bottomPage.findMany({ orderBy: [{ section: "asc" }, { label: "asc" }] });
}
