import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/utils/db";

const getSession = () => getServerSession(authOptions);

export async function GET() {
  const reviews = await prisma.review.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  const session = (await getSession()) as { user?: { id?: string } } | null;
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "يجب تسجيل الدخول لإضافة تعليق" }, { status: 401 });
  }

  const body = await request.json();
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  if (comment.length < 3 || comment.length > 1000) {
    return NextResponse.json({ error: "يجب أن يكون التعليق بين 3 و1000 حرف" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: { comment, userId },
    include: { user: { select: { email: true } } },
  });

  return NextResponse.json(review, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = (await getSession()) as { user?: { role?: string } } | null;
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Review ID is required" }, { status: 400 });

  await prisma.review.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
