import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const hasAnnouncementAccess = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string; permissions?: string[] } | undefined;
  return user?.role === "admin" || user?.permissions?.includes("announcements");
};

export async function GET() {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(announcements, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await hasAnnouncementAccess())) return NextResponse.json({ error: "Announcement access required" }, { status: 403 });
  const formData = await request.formData();
  const file = formData.get("file");
  const title = String(formData.get("title") || "").trim() || null;
  if (!(file instanceof File) || (!file.type.startsWith("image/") && !file.type.startsWith("video/"))) return NextResponse.json({ error: "Upload an image or video" }, { status: 400 });
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "Media must be smaller than 12 MB" }, { status: 400 });
  const media = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
  const announcement = await prisma.announcement.create({ data: { title, media, mediaType: file.type.startsWith("video/") ? "video" : "image" } });
  return NextResponse.json(announcement, { status: 201 });
}

export async function PUT(request: Request) {
  if (!(await hasAnnouncementAccess())) return NextResponse.json({ error: "Announcement access required" }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Announcement id is required" }, { status: 400 });
  const formData = await request.formData();
  const title = String(formData.get("title") || "").trim() || null;
  const file = formData.get("file");
  const data: { title: string | null; media?: string; mediaType?: string } = { title };
  if (file instanceof File && file.size > 0) {
    if ((!file.type.startsWith("image/") && !file.type.startsWith("video/")) || file.size > 12 * 1024 * 1024) return NextResponse.json({ error: "Upload an image or video smaller than 12 MB" }, { status: 400 });
    data.media = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
    data.mediaType = file.type.startsWith("video/") ? "video" : "image";
  }
  const announcement = await prisma.announcement.update({ where: { id }, data });
  return NextResponse.json(announcement);
}

export async function DELETE(request: Request) {
  if (!(await hasAnnouncementAccess())) return NextResponse.json({ error: "Announcement access required" }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Announcement id is required" }, { status: 400 });
  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ id });
}