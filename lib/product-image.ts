export function getProductImageSrc(product: {
  id: string;
  imageUrl: string | null;
  hasCustomImage: boolean;
}): string | null {
  if (product.hasCustomImage) return `/api/products/${product.id}/image`;
  return product.imageUrl;
}
