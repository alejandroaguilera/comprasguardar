export const CURRENCIES = [
  { code: "USD", label: "USD — Dólar estadounidense" },
  { code: "MXN", label: "MXN — Peso mexicano" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — Libra esterlina" },
  { code: "CAD", label: "CAD — Dólar canadiense" },
  { code: "JPY", label: "JPY — Yen japonés" },
  { code: "BRL", label: "BRL — Real brasileño" },
  { code: "COP", label: "COP — Peso colombiano" },
  { code: "ARS", label: "ARS — Peso argentino" },
  { code: "CLP", label: "CLP — Peso chileno" },
] as const;

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function isKnownCurrency(code: string): code is CurrencyCode {
  return (CURRENCY_CODES as readonly string[]).includes(code);
}
