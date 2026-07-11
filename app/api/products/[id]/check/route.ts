import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeProduct } from "@/lib/scraper";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      type: true,
      url: true,
      priceEntries: { orderBy: { checkedAt: "desc" }, take: 1 },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  if (product.type !== "ONLINE" || !product.url) {
    return NextResponse.json(
      { error: "Este producto es de tienda física, no se puede revisar el precio automáticamente" },
      { status: 400 },
    );
  }

  const result = await scrapeProduct(product.url);

  if (result.price === null) {
    await prisma.product.update({
      where: { id },
      data: { lastCheckedAt: new Date() },
    });
    return NextResponse.json({
      changed: false,
      price: null,
      warning: result.warning ?? "No se pudo detectar el precio automáticamente",
    });
  }

  const lastEntry = product.priceEntries[0];
  const changed = !lastEntry || Number(lastEntry.price) !== result.price;

  if (changed) {
    await prisma.priceEntry.create({
      data: { productId: id, price: result.price, source: "AUTO" },
    });
  }

  await prisma.product.update({
    where: { id },
    data: { lastCheckedAt: new Date() },
  });

  return NextResponse.json({ changed, price: result.price });
}
