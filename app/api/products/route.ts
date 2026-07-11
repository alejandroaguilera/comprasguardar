import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CURRENCY_CODES } from "@/lib/currencies";
import { productSelect } from "@/lib/product-select";

export async function GET(request: NextRequest) {
  const archivedParam = request.nextUrl.searchParams.get("archived");
  const archived = archivedParam === "true";

  const products = await prisma.product.findMany({
    where: { archived },
    orderBy: { createdAt: "desc" },
    select: {
      ...productSelect,
      priceEntries: {
        orderBy: { checkedAt: "desc" },
        take: 2,
      },
    },
  });

  return NextResponse.json(products);
}

const createSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1),
  nameSource: z.enum(["AUTO", "MANUAL"]),
  price: z.number().positive(),
  priceSource: z.enum(["AUTO", "MANUAL"]),
  currency: z.enum(CURRENCY_CODES as [string, ...string[]]).default("USD"),
  imageUrl: z.string().url().nullable().optional(),
  store: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { url, name, nameSource, price, priceSource, currency, imageUrl, store } = parsed.data;

  try {
    const product = await prisma.product.create({
      data: {
        url,
        name,
        nameSource,
        currency,
        imageUrl: imageUrl ?? null,
        store,
        lastCheckedAt: new Date(),
        priceEntries: {
          create: { price, source: priceSource },
        },
      },
      select: { ...productSelect, priceEntries: true },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json({ error: "Ya estás rastreando este producto" }, { status: 409 });
    }
    throw err;
  }
}
