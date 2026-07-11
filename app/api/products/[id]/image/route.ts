import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { imageData: true, imageMimeType: true },
  });

  if (!product?.imageData || !product.imageMimeType) {
    return NextResponse.json({ error: "Sin imagen" }, { status: 404 });
  }

  return new NextResponse(product.imageData, {
    headers: {
      "Content-Type": product.imageMimeType,
      "Cache-Control": "private, max-age=86400",
    },
  });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo no válido" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "La imagen no puede pesar más de 5MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  await prisma.product.update({
    where: { id },
    data: {
      imageData: buffer,
      imageMimeType: file.type,
      hasCustomImage: true,
      imageUrl: null,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  await prisma.product.update({
    where: { id },
    data: {
      imageData: null,
      imageMimeType: null,
      hasCustomImage: false,
      imageUrl: null,
    },
  });

  return NextResponse.json({ ok: true });
}
