import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { TrendBadge } from "@/components/TrendBadge";
import { StoreBadge } from "@/components/StoreBadge";
import { CheckPriceButton } from "@/components/CheckPriceButton";
import { ArchiveButton } from "@/components/ArchiveButton";
import { DeleteButton } from "@/components/DeleteButton";
import { formatDate, formatPrice } from "@/lib/format";
import { getProductImageSrc } from "@/lib/product-image";

type ProductCardProps = {
  product: {
    id: string;
    type: "ONLINE" | "IN_STORE";
    name: string;
    imageUrl: string | null;
    hasCustomImage: boolean;
    store: string;
    currency: string;
    createdAt: string | Date;
    archived: boolean;
    priceEntries: { price: string | number; checkedAt: string | Date }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const [latest, previous] = product.priceEntries;
  const currentPrice = latest ? Number(latest.price) : null;
  const previousPrice = previous ? Number(previous.price) : undefined;
  const imageSrc = getProductImageSrc(product);

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-800">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-4"
            unoptimized={product.hasCustomImage}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <ImageOff className="size-10" />
          </div>
        )}
      </div>
      <CardHeader className="gap-1 pb-0">
        <StoreBadge type={product.type} store={product.store} className="w-fit" />
        <Link href={`/products/${product.id}`} className="line-clamp-2 font-medium hover:underline">
          {product.name}
        </Link>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 pt-3">
        <div className="text-2xl font-semibold">
          {currentPrice !== null ? formatPrice(currentPrice, product.currency) : "Sin precio"}
        </div>
        {currentPrice !== null && (
          <TrendBadge current={currentPrice} previous={previousPrice} currency={product.currency} />
        )}
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Agregado el {formatDate(product.createdAt)}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        {product.archived ? (
          <>
            <ArchiveButton productId={product.id} archived={product.archived} />
            <DeleteButton productId={product.id} />
          </>
        ) : (
          <>
            {product.type === "ONLINE" && <CheckPriceButton productId={product.id} />}
            <ArchiveButton productId={product.id} archived={product.archived} />
          </>
        )}
      </CardFooter>
    </Card>
  );
}
