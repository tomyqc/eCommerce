import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type Pub = { slot: string; name: string; image: string };
const configPath = path.join(process.cwd(), "public", "pubs-config.json");
const directory = path.join(process.cwd(), "public", "pubs");
const extensions: Record<string, string> = { "image/svg+xml": "svg", "image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg" };
const isAdmin = async () => ((await getServerSession(authOptions)) as { user?: { role?: string } } | null)?.user?.role === "admin";
const readPubs = async (): Promise<Pub[]> => JSON.parse(await readFile(configPath, "utf8"));

export async function GET() {
  return NextResponse.json(await readPubs(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const slot = new URL(request.url).searchParams.get("slot") || `pub-${Date.now()}`;
  const file = (await request.formData()).get("image");
  const extension = file instanceof File ? extensions[file.type] : undefined;
  if (!/^pub-[0-9]+$/.test(slot) && !/^G[1-6]$/.test(slot)) return NextResponse.json({ error: "Invalid photo slot" }, { status: 400 });
  if (!(file instanceof File) || !extension) return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Image must be smaller than 4 MB" }, { status: 400 });
  await mkdir(directory, { recursive: true });
  const files = await readdir(directory);
  await Promise.all(files.filter((name) => name.startsWith(`${slot}.`)).map((name) => unlink(path.join(directory, name))));
  const image = `/pubs/${slot}.${extension}`;
  await writeFile(path.join(process.cwd(), "public", image.slice(1)), Buffer.from(await file.arrayBuffer()));
  const pubs = await readPubs();
  const pub = pubs.find((item) => item.slot === slot);
  const updatedPub = pub || { slot, name: slot, image };
  if (pub) pub.image = image;
  else pubs.push(updatedPub);
  await writeFile(configPath, `${JSON.stringify(pubs, null, 2)}\n`);
  return NextResponse.json(updatedPub);
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const slot = new URL(request.url).searchParams.get("slot");
  if (!slot) return NextResponse.json({ error: "Photo slot is required" }, { status: 400 });
  const files = await readdir(directory).catch(() => [] as string[]);
  await Promise.all(files.filter((name) => name.startsWith(`${slot}.`)).map((name) => unlink(path.join(directory, name))));
  const pubs = await readPubs();
  const remainingPubs = pubs.filter((item) => item.slot !== slot);
  await writeFile(configPath, `${JSON.stringify(remainingPubs, null, 2)}\n`);
  return NextResponse.json({ slot });
}
