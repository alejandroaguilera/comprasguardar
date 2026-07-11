export function formatPrice(price: number | string, currency: string): string {
  const value = typeof price === "string" ? Number(price) : price;
  try {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(d);
}
