import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { scrapeProduct } from "@/lib/scraper";

const bodySchema = z.object({ url: z.string().url() });

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const result = await scrapeProduct(parsed.data.url);
  return NextResponse.json(result);
}
