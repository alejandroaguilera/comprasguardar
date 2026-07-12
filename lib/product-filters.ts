import type { Prisma } from "@prisma/client";

export function buildProductWhere(
  archived: boolean,
  searchParams: { q?: string; type?: string; store?: string },
): Prisma.ProductWhereInput {
  const { q, type, store } = searchParams;
  return {
    archived,
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(type === "ONLINE" || type === "IN_STORE" ? { type } : {}),
    ...(store ? { store } : {}),
  };
}
