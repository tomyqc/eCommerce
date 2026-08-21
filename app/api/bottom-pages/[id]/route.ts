import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/utils/db";
import { bottomPageSections } from "@/lib/bottom-page-config";

const isAdmin = async () => {
  const session = (await getServerSession(authOptions)) as { user?: { role?: string } } | null;
  return session?.user?.role === "admin";
};

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const section = typeof body.section === "string" ? body.section : "";
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!bottomPageSections.includes(section as (typeof bottomPageSections)[number]) || !label || !slug || !title || !content) {
    return NextResponse.json({ error: "Section, label, slug, title, and content are required" }, { status: 400 });
  }

  try {
    const page = await prisma.bottomPage.update({ where: { id }, data: { section, label, slug, title, content } });
    return NextResponse.json(page);
  } catch {
    return NextResponse.json({ error: "Page could not be updated" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.bottomPage.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Page could not be deleted" }, { status: 404 });
  }
}
