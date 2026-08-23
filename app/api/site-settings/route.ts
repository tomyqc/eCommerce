import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const allowedTypes: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const isAdmin = async () => (await getServerSession(authOptions))?.user?.role === "admin";

export async function GET() {
  const settings = await prisma.siteSettings.upsert({ where: { id: "default" }, create: {}, update: {} });
  return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const body = await request.json();
  const opacity = Number(body.backgroundOpacity);
  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" }, create: {},
    update: { backgroundOpacity: Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 0.2 },
  });
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const formData = await request.formData();
  const kind = formData.get("kind");
  const file = formData.get("file");
  if ((kind !== "logo" && kind !== "background") || !(file instanceof File)) return NextResponse.json({ error: "Invalid branding upload" }, { status: 400 });
  const extension = allowedTypes[file.type];
  if (!extension || file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Use a PNG, JPG, or WebP image smaller than 4 MB" }, { status: 400 });
  const dataUrl = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
  const field = kind === "logo" ? { logoPath: dataUrl } : { backgroundPath: dataUrl };
  const settings = await prisma.siteSettings.upsert({ where: { id: "default" }, create: { ...field }, update: field });
  return NextResponse.json(settings);
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const kind = new URL(request.url).searchParams.get("kind");
  if (kind !== "logo" && kind !== "background") return NextResponse.json({ error: "Invalid branding type" }, { status: 400 });
  const field = kind === "logo" ? { logoPath: "/Logo.png" } : { backgroundPath: "/ChatGPT Image Aug 20, 2026, 01_07_50 PM.png" };
  const settings = await prisma.siteSettings.upsert({ where: { id: "default" }, create: { ...field }, update: field });
  return NextResponse.json(settings);
}