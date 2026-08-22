import { NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const images = await prisma.image.findMany({ where: { productID: id } });
  return NextResponse.json(images);
}