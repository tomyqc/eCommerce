import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const allowedTypes: Record<string, string> = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const getCategoryId = (request: Request) => {
  const value = new URL(request.url).searchParams.get("categoryId");
  return value && /^[a-zA-Z0-9-]{1,80}$/.test(value) ? value : null;
};

const isAdmin = async () => {
  const session = (await getServerSession(authOptions)) as { user?: { role?: string } } | null;
  return session?.user?.role === "admin";
};

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const categoryId = getCategoryId(request);
  if (!categoryId) return NextResponse.json({ error: "Category ID is required" }, { status: 400 });

  const file = (await request.formData()).get("icon");
  const extension = file instanceof File ? allowedTypes[file.type] : undefined;
  if (!(file instanceof File) || !extension) {
    return NextResponse.json({ error: "Please upload an SVG, PNG, JPG, or JPEG icon" }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Icon must be smaller than 2 MB" }, { status: 400 });
  }

  const directory = path.join(process.cwd(), "public", "category-icons");
  await writeFile(path.join(directory, `.keep`), "").catch(() => undefined);
  const files = await readdir(directory);
  await Promise.all(files.filter((name) => name.startsWith(`${categoryId}.`)).map((name) => unlink(path.join(directory, name))));
  await writeFile(path.join(directory, `${categoryId}.${extension}`), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ message: "Category icon updated" });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const categoryId = getCategoryId(request);
  if (!categoryId) return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
  const directory = path.join(process.cwd(), "public", "category-icons");
  const files = await readdir(directory);
  await Promise.all(files.filter((name) => name.startsWith(`${categoryId}.`)).map((name) => unlink(path.join(directory, name))));
  return NextResponse.json({ message: "Category icon deleted" });
}

export async function GET(request: Request) {
  const categoryId = getCategoryId(request);
  if (!categoryId) return new Response(null, { status: 400 });
  const directory = path.join(process.cwd(), "public", "category-icons");
  const contentTypes: Record<string, string> = { svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg" };
  for (const extension of Object.keys(contentTypes)) {
    try {
      const icon = await readFile(path.join(directory, `${categoryId}.${extension}`));
      return new Response(new Uint8Array(icon), { headers: { "Content-Type": contentTypes[extension], "Cache-Control": "no-store" } });
    } catch {
      continue;
    }
  }
  const fallback = await readFile(path.join(process.cwd(), "public", "pc icon.png"));
  return new Response(new Uint8Array(fallback), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
}
