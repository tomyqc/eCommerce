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
  const where = category ? { category: { name: category } } : undefined;
  const [products, total] = await Promise.all([
    prisma.product.findMany({
    where,
    skip: (page - 1) * 9,
    take: 9,
    include: { category: { select: { name: true } } },
    orderBy,
    }),
    prisma.product.count({ where }),
  ]);
  return NextResponse.json(products, { headers: { "X-Total-Count": String(total), "X-Total-Pages": String(Math.max(1, Math.ceil(total / 9))) } });
}