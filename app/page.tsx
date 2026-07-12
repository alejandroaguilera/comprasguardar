import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { productSelect } from "@/lib/product-select";
import { buildProductWhere } from "@/lib/product-filters";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string; type?: string; store?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const hasFilters = Boolean(params.q || params.type || params.store);

  const [products, stores] = await Promise.all([
    prisma.product.findMany({
      where: buildProductWhere(false, params),
      orderBy: { createdAt: "desc" },
      select: {
        ...productSelect,
        priceEntries: {
          orderBy: { checkedAt: "desc" },
          take: 2,
        },
      },
    }),
    prisma.store.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tu lista de deseos</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {products.length} producto{products.length === 1 ? "" : "s"} en seguimiento
          </p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="size-4" />
            Agregar producto
          </Link>
        </Button>
      </div>

      <ProductFilters stores={stores.map((s) => s.name)} />

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p className="text-neutral-500 dark:text-neutral-400">
            {hasFilters
              ? "No hay productos que coincidan con tu búsqueda."
              : "Aún no tienes productos guardados."}
          </p>
          {!hasFilters && (
            <Button asChild className="mt-4">
              <Link href="/products/new">Agregar tu primer producto</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                createdAt: product.createdAt.toISOString(),
                priceEntries: product.priceEntries.map((entry) => ({
                  price: Number(entry.price),
                  checkedAt: entry.checkedAt.toISOString(),
                })),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
