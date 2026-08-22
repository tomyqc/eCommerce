import { NextResponse } from "next/server";
import prisma from "@/utils/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const sort = searchParams.get("sort");
  const category = searchParams.get("category");
  const orderBy = sort === "titleAsc" ? { title: "asc" as const }
    : sort === "titleDesc" ? { title: "desc" as const }
    : sort === "lowPrice" ? { price: "asc" as const }
    : sort === "highPrice" ? { price: "desc" as const }
    : undefined;
  const products = await prisma.product.findMany({
    where: category ? { category: { name: category } } : undefined,
    skip: (page - 1) * 9,
    take: 9,
    include: { category: { select: { name: true } } },
    orderBy,
  });
  return NextResponse.json(products);
}