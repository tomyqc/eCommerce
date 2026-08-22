import { CategoryMenu, Hero, IntroducingSection, ProductsSection, PromotionWidget, ReviewsSection } from "@/components";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
    <Hero />
    <IntroducingSection />
    <PromotionWidget />
    <CategoryMenu />
    <ProductsSection />
    <ReviewsSection />
    </>
  );
}
