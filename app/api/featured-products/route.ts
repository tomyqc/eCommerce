import { NextResponse } from "next/server";
import config from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/products?mode=home`, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ error: "Products could not be loaded" }, { status: response.status });
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ error: "Product service is unavailable" }, { status: 503 });
  }
}
