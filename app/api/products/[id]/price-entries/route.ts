import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  price: z.number().positive(),
  checkedAt: z.string().datetime().optional(),
});

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const entry = await prisma.priceEntry.create({
    data: {
      productId: id,
      price: parsed.data.price,
      source: "MANUAL",
      checkedAt: parsed.data.checkedAt ? new Date(parsed.data.checkedAt) : new Date(),
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
