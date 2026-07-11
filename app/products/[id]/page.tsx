import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, ImageOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { productSelect } from "@/lib/product-select";
import { getProductImageSrc } from "@/lib/product-image";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendBadge } from "@/components/TrendBadge";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { CheckPriceButton } from "@/components/CheckPriceButton";
import { AddManualPriceForm } from "@/components/AddManualPriceForm";
import { ArchiveButton } from "@/components/ArchiveButton";
import { DeleteButton } from "@/components/DeleteButton";
import { ChangeImageForm } from "@/components/ChangeImageForm";
import { formatDate, formatPrice } from "@/lib/format";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: Params) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      ...productSelect,
      priceEntries: { orderBy: { checkedAt: "asc" } },
    },
  });

  if (!product) notFound();

  const imageSrc = getProductImageSrc(product);

  const entries = product.priceEntries.map((entry) => ({
    price: Number(entry.price),
    checkedAt: entry.checkedAt.toISOString(),
    source: entry.source,
  }));
  const latest = entries[entries.length - 1];
  const previous = entries[entries.length - 2];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="mb-4 flex w-fit items-center gap-1 text-sm text-neutral-500 hover:underline dark:text-neutral-400"
      >
        <ArrowLeft className="size-4" />
        Volver al dashboard
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex shrink-0 flex-col gap-2 sm:w-56">
          <div className="relative aspect-square w-full rounded-xl bg-neutral-100 dark:bg-neutral-800">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                sizes="224px"
                className="object-contain p-4"
                unoptimized={product.hasCustomImage}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-400">
                <ImageOff className="size-10" />
              </div>
            )}
          </div>
          <ChangeImageForm productId={product.id} hasImage={imageSrc !== null} />
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            {product.store}
          </Badge>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-1 text-sm text-neutral-500 hover:underline dark:text-neutral-400"
          >
            Ver en la tienda
            <ExternalLink className="size-3.5" />
          </a>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-semibold">
              {latest ? formatPrice(latest.price, product.currency) : "Sin precio"}
            </span>
            {latest && (
              <TrendBadge current={latest.price} previous={previous?.price} currency={product.currency} />
            )}
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Agregado el {formatDate(product.createdAt)}
            {product.lastCheckedAt && ` · Última revisión ${formatDate(product.lastCheckedAt)}`}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <CheckPriceButton productId={product.id} />
            <AddManualPriceForm productId={product.id} />
            <ArchiveButton productId={product.id} archived={product.archived} />
            <DeleteButton productId={product.id} />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Historial de precios</h2>
        {entries.length > 0 && <PriceHistoryChart entries={entries} currency={product.currency} />}

        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Origen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...entries].reverse().map((entry, i) => (
                <TableRow key={i}>
                  <TableCell>{formatDate(entry.checkedAt)}</TableCell>
                  <TableCell>{formatPrice(entry.price, product.currency)}</TableCell>
                  <TableCell>
                    <Badge variant={entry.source === "AUTO" ? "good" : "secondary"}>
                      {entry.source === "AUTO" ? "Auto" : "Manual"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
