import { AnnouncementsWidget, CategoryMenu, Hero, IntroducingSection, ProductsSection, PromotionWidget, ReviewsSection } from "@/components";
import prisma from "@/utils/db";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ homePage?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.homePage) || 1);
  const totalProducts = await prisma.product.count();
  return (
    <>
    <IntroducingSection />
    <AnnouncementsWidget />
    <Hero />
    <PromotionWidget />
    <CategoryMenu />
    <ProductsSection page={page} totalPages={Math.max(1, Math.ceil(totalProducts / 15))} />
    <ReviewsSection />
    </>
  );
}
