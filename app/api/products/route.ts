import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CURRENCY_CODES } from "@/lib/currencies";
import { productSelect } from "@/lib/product-select";

export async function GET(request: NextRequest) {
  const archivedParam = request.nextUrl.searchParams.get("archived");
  const archived = archivedParam === "true";
  const typeParam = request.nextUrl.searchParams.get("type");
  const type = typeParam === "ONLINE" || typeParam === "IN_STORE" ? typeParam : undefined;

  const products = await prisma.product.findMany({
    where: { archived, ...(type ? { type } : {}) },
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

const commonFields = {
  name: z.string().min(1),
  nameSource: z.enum(["AUTO", "MANUAL"]),
  price: z.number().positive(),
  priceSource: z.enum(["AUTO", "MANUAL"]),
  currency: z.enum(CURRENCY_CODES as [string, ...string[]]).default("USD"),
  imageUrl: z.string().url().nullable().optional(),
  store: z.string().min(1),
};

const createSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("ONLINE"), url: z.string().url(), ...commonFields }),
  z.object({ type: z.literal("IN_STORE"), ...commonFields }),
]);

export async function POST(request: NextRequest) {
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { type, name, nameSource, price, priceSource, currency, imageUrl, store } = parsed.data;
  const url = parsed.data.type === "ONLINE" ? parsed.data.url : null;

  try {
    const [product] = await prisma.$transaction([
      prisma.product.create({
        data: {
          type,
          url,
          name,
          nameSource,
          currency,
          imageUrl: imageUrl ?? null,
          store,
          lastCheckedAt: type === "ONLINE" ? new Date() : null,
          priceEntries: {
            create: { price, source: priceSource },
          },
        },
        select: { ...productSelect, priceEntries: true },
      }),
      prisma.store.upsert({
        where: { name: store },
        create: { name: store },
        update: {},
      }),
    ]);
    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json({ error: "Ya estás rastreando este producto" }, { status: 409 });
    }
    throw err;
  }
}
