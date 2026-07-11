import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      priceEntries: { orderBy: { checkedAt: "asc" } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return NextResponse.json(product);
}

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  archived: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(product);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
