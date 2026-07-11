const STORE_MAP: Record<string, string> = {
  "amazon.com": "Amazon",
  "amazon.com.mx": "Amazon MX",
  "bestbuy.com": "BestBuy",
  "footlocker.com": "Footlocker",
  "adidas.com": "Adidas",
  "adidas.mx": "Adidas",
  "nike.com": "Nike",
  "walmart.com": "Walmart",
  "target.com": "Target",
  "ebay.com": "eBay",
};

export function storeNameFromUrl(url: string): string {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Desconocido";
  }

  if (STORE_MAP[hostname]) return STORE_MAP[hostname];

  // strip subdomains down to registrable-ish domain for fallback lookup, then
  // fall back to the bare hostname capitalized if still unmapped.
  const parts = hostname.split(".");
  const bareDomain = parts.slice(-2).join(".");
  if (STORE_MAP[bareDomain]) return STORE_MAP[bareDomain];

  const label = parts.length > 2 ? bareDomain : hostname;
  return label.charAt(0).toUpperCase() + label.slice(1);
}
