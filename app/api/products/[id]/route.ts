import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { productSelect } from "@/lib/product-select";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      ...productSelect,
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
  imageUrl: z.string().url().nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { imageUrl, ...rest } = parsed.data;
  const isSettingImageUrl = imageUrl !== undefined;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      ...(isSettingImageUrl
        ? { imageUrl, hasCustomImage: false, imageData: null, imageMimeType: null }
        : {}),
    },
    select: productSelect,
  });

  return NextResponse.json(product);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
