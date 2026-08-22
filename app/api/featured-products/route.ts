import { NextResponse } from "next/server";
import prisma from "@/utils/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({ include: { category: { select: { name: true } } } });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Product service is unavailable" }, { status: 503 });
  }
}
