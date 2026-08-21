import { notFound } from "next/navigation";
import { getBottomPages } from "@/lib/bottom-pages";

export const dynamic = "force-dynamic";

export default async function BottomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pages = await getBottomPages();
  const page = pages.find((item) => item.slug === slug);

  if (!page) notFound();

  return (
    <main className="mx-auto w-full max-w-screen-xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">{page.section}</p>
      <h1 className="mt-3 text-4xl font-bold text-black">{page.title}</h1>
      <div className="mt-8 max-w-3xl whitespace-pre-wrap text-lg leading-8 text-gray-700">{page.content}</div>
    </main>
  );
}
