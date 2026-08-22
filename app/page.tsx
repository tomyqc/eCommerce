import { CategoryMenu, Hero, IntroducingSection, ProductsSection, ProductPhotoWidget, PromotionWidget, ReviewsSection } from "@/components";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
    <Hero />
    <ProductPhotoWidget />
    <IntroducingSection />
    <PromotionWidget />
    <CategoryMenu />
    <ProductsSection />
    <ReviewsSection />
    </>
  );
}
