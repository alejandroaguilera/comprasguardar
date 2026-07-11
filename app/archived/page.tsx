import { prisma } from "@/lib/prisma";
import { productSelect } from "@/lib/product-select";
import { buildProductWhere } from "@/lib/product-filters";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string; type?: string }> };

export default async function ArchivedPage({ searchParams }: Props) {
  const params = await searchParams;
  const hasFilters = Boolean(params.q || params.type);

  const products = await prisma.product.findMany({
    where: buildProductWhere(true, params),
    orderBy: { updatedAt: "desc" },
    select: {
      ...productSelect,
      priceEntries: {
        orderBy: { checkedAt: "desc" },
        take: 2,
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Archivados</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Productos que ya compraste o que ya no te interesan. Su historial de precios se conserva.
        </p>
      </div>

      <ProductFilters />

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p className="text-neutral-500 dark:text-neutral-400">
            {hasFilters ? "No hay productos archivados que coincidan con tu búsqueda." : "No hay productos archivados."}
          </p>
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
