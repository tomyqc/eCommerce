import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
  if ((session as any)?.user?.role !== "admin" && !((session as any)?.user?.permissions || []).length) {
    redirect("/");
  }
  
  return session;
}

export async function requireDashboardAccess(permission: string) {
  const session = await getServerSession(authOptions);
  const permissions = (session as any)?.user?.permissions || [];
  if (!session || ((session as any)?.user?.role !== "admin" && !permissions.includes(permission))) redirect("/");
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return (session as any)?.user?.role === "admin";
}

