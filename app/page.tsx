import { AnnouncementsWidget, CategoryMenu, Hero, IntroducingSection, ProductsSection, PromotionWidget, ReviewsSection } from "@/components";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
    <IntroducingSection />
    <AnnouncementsWidget />
    <Hero />
    <PromotionWidget />
    <CategoryMenu />
    <ProductsSection />
    <ReviewsSection />
    </>
  );
}
