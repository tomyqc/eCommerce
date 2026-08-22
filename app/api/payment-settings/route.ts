import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const requireAdmin = async () => {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
};

export async function GET() {
  const settings = await prisma.paymentSettings.findUnique({ where: { id: "default" } });
  return NextResponse.json({ ccpAccount: settings?.ccpAccount || "", bankAccount: settings?.bankAccount || "", shippingCost: settings?.shippingCost ?? 5 });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const body = await request.json();
  const data = {
    ccpAccount: typeof body.ccpAccount === "string" && body.ccpAccount.trim() ? body.ccpAccount.trim().slice(0, 120) : null,
    bankAccount: typeof body.bankAccount === "string" && body.bankAccount.trim() ? body.bankAccount.trim().slice(0, 120) : null,
    shippingCost: Number.isFinite(Number(body.shippingCost)) ? Math.max(0, Math.round(Number(body.shippingCost))) : 5,
  };
  const settings = await prisma.paymentSettings.upsert({ where: { id: "default" }, create: { id: "default", ...data }, update: data });
  return NextResponse.json({ ccpAccount: settings.ccpAccount || "", bankAccount: settings.bankAccount || "", shippingCost: settings.shippingCost });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const account = new URL(request.url).searchParams.get("account");
  if (account !== "ccp" && account !== "bank") return NextResponse.json({ error: "Invalid account" }, { status: 400 });
  const data = account === "ccp" ? { ccpAccount: null } : { bankAccount: null };
  await prisma.paymentSettings.upsert({ where: { id: "default" }, create: { id: "default", ccpAccount: null, bankAccount: null, shippingCost: 5 }, update: data });
  return NextResponse.json({ message: "Payment account removed" });
}