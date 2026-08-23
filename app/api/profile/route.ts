import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/utils/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function currentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

function publicUser(user: any) {
  if (!user) return user;
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function GET() {
  const user = await currentUser();
  return user ? NextResponse.json(publicUser(user)) : NextResponse.json({ error: "Authentication required" }, { status: 401 });
}

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim() || null;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  if (body.password && String(body.password).length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  const data: any = { name, email };
  if (body.password) data.password = await bcrypt.hash(String(body.password), 14);
  if (typeof body.image === "string") {
    if (body.image.length > 5_500_000 || !body.image.startsWith("data:image/")) return NextResponse.json({ error: "Invalid profile photo" }, { status: 400 });
    data.image = body.image;
  }
  try {
    const updated = await prisma.user.update({ where: { id: user.id }, data });
    return NextResponse.json(publicUser(updated));
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
    return NextResponse.json({ error: "Profile could not be updated" }, { status: 500 });
  }
}
