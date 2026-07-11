import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ArchivedPage() {
  const products = await prisma.product.findMany({
    where: { archived: true },
    orderBy: { updatedAt: "desc" },
    include: {
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

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p className="text-neutral-500 dark:text-neutral-400">No hay productos archivados.</p>
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
