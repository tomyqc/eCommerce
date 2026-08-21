import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import { readFile, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const defaultSlots = ["visa", "mastercard", "edahabia"];

const getSlot = (request: Request): string => {
  const value = new URL(request.url).searchParams.get("slot");
  return value && /^[a-z0-9-]{2,40}$/.test(value) ? value : "edahabia";
};

const requireAdmin = async () => {
  const session = (await getServerSession(authOptions)) as {
    user?: { role?: string };
  } | null;

  return session?.user?.role === "admin";
};

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const slot = getSlot(request);

  const formData = await request.formData();
  const file = formData.get("logo");

  const allowedTypes: Record<string, string> = {
    "image/svg+xml": "svg",
    "image/png": "png",
    "image/jpeg": "jpg",
  };
  const extension = file instanceof File ? allowedTypes[file.type] : undefined;

  if (!(file instanceof File) || !extension) {
    return NextResponse.json(
      { error: "Please upload an SVG, PNG, JPG, or JPEG logo" },
      { status: 400 }
    );
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Logo must be smaller than 2 MB" }, { status: 400 });
  }

  const publicDirectory = path.join(process.cwd(), "public");
  const existingFiles = await readdir(publicDirectory);
  await Promise.all(
    existingFiles
      .filter((name) => name.startsWith(`payment-${slot}.`) && /\.(svg|png|jpg)$/.test(name))
      .map((name) => unlink(path.join(publicDirectory, name)))
  );

  await writeFile(
    path.join(publicDirectory, `payment-${slot}.${extension}`),
    Buffer.from(await file.arrayBuffer())
  );
  return NextResponse.json({ message: `${slot} logo updated` });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const slot = getSlot(request);
  const publicDirectory = path.join(process.cwd(), "public");
  const existingFiles = await readdir(publicDirectory);
  await Promise.all(
    existingFiles
      .filter((name) => name.startsWith(`payment-${slot}.`) && /\.(svg|png|jpg)$/.test(name))
      .map((name) => unlink(path.join(publicDirectory, name)))
  );

  return NextResponse.json({ message: `${slot} logo restored` });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  if (requestUrl.searchParams.get("format") === "json") {
    const publicDirectory = path.join(process.cwd(), "public");
    const files = await readdir(publicDirectory);
    const uploadedSlots = files
      .map((name) => name.match(/^payment-(.+)\.(svg|png|jpg)$/))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => match[1]);
    const logoSlots = [...new Set([...defaultSlots, ...uploadedSlots])];
    return NextResponse.json(logoSlots.map((logoSlot) => ({
      slot: logoSlot,
      name: logoSlot.replace(/-/g, " "),
      url: `/api/payment-logo?slot=${logoSlot}`,
    })));
  }

  const slot = getSlot(request);
  const publicDirectory = path.join(process.cwd(), "public");
  const contentTypes: Record<string, string> = {
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
  };

  for (const extension of Object.keys(contentTypes)) {
    try {
      const logo = await readFile(path.join(publicDirectory, `payment-${slot}.${extension}`));
      return new Response(new Uint8Array(logo), {
        headers: {
          "Content-Type": contentTypes[extension],
          "Cache-Control": "no-store",
        },
      });
    } catch {
      continue;
    }
  }

  try {
    const defaultName = slot === "visa" ? "visa.svg" : slot === "mastercard" ? "mastercard.svg" : slot === "edahabia" ? "edahabia.svg" : "";
    if (!defaultName) return new Response(null, { status: 404 });
    const defaultLogo = await readFile(path.join(publicDirectory, defaultName));
    return new Response(new Uint8Array(defaultLogo), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
