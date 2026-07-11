import * as cheerio from "cheerio";
import { lookup } from "node:dns/promises";
import { storeNameFromUrl } from "./stores";

export type ScrapeResult = {
  name: string | null;
  nameSource: "AUTO" | "MANUAL";
  price: number | null;
  priceSource: "AUTO" | "MANUAL";
  currency: string;
  imageUrl: string | null;
  store: string;
  warning?: string;
};

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 2 * 1024 * 1024;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function isPrivateIp(ip: string): boolean {
  // IPv4
  const v4 = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 127) return true; // loopback
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 0) return true;
    return false;
  }
  // IPv6
  const lower = ip.toLowerCase();
  if (lower === "::1") return true; // loopback
  if (lower.startsWith("fe80:")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
  return false;
}

async function assertPublicUrl(rawUrl: string): Promise<URL> {
  const url = new URL(rawUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Protocolo no permitido");
  }
  const { address } = await lookup(url.hostname);
  if (isPrivateIp(address)) {
    throw new Error("No se permite acceder a direcciones privadas");
  }
  return url;
}

function extractFromJsonLd($: cheerio.CheerioAPI): {
  name?: string;
  price?: number;
  currency?: string;
  image?: string;
} {
  const scripts = $('script[type="application/ld+json"]');
  for (const el of scripts.toArray()) {
    const raw = $(el).contents().text();
    if (!raw) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }

    const candidates = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { "@graph"?: unknown[] })?.["@graph"])
        ? (parsed as { "@graph": unknown[] })["@graph"]
        : [parsed];

    for (const node of candidates) {
      if (!node || typeof node !== "object") continue;
      const obj = node as Record<string, unknown>;
      const type = obj["@type"];
      const isProduct =
        type === "Product" || (Array.isArray(type) && type.includes("Product"));
      if (!isProduct) continue;

      const name = typeof obj.name === "string" ? obj.name : undefined;
      const image =
        typeof obj.image === "string"
          ? obj.image
          : Array.isArray(obj.image) && typeof obj.image[0] === "string"
            ? obj.image[0]
            : undefined;

      const offersRaw = obj.offers;
      const offers = Array.isArray(offersRaw) ? offersRaw : offersRaw ? [offersRaw] : [];
      let price: number | undefined;
      let currency: string | undefined;
      for (const offer of offers) {
        if (!offer || typeof offer !== "object") continue;
        const p = (offer as Record<string, unknown>).price;
        const num = typeof p === "string" ? Number(p) : typeof p === "number" ? p : NaN;
        if (!Number.isNaN(num)) {
          price = num;
          const c = (offer as Record<string, unknown>).priceCurrency;
          currency = typeof c === "string" ? c : undefined;
          break;
        }
      }

      if (name || price !== undefined || image) {
        return { name, price, currency, image };
      }
    }
  }
  return {};
}

function extractFromOpenGraph($: cheerio.CheerioAPI): {
  name?: string;
  price?: number;
  currency?: string;
  image?: string;
} {
  const meta = (prop: string) => $(`meta[property="${prop}"]`).attr("content");

  const name = meta("og:title") || undefined;
  const image = meta("og:image") || undefined;
  const priceRaw =
    meta("product:price:amount") || meta("og:price:amount") || undefined;
  const price = priceRaw ? Number(priceRaw) : undefined;
  const currency =
    meta("product:price:currency") || meta("og:price:currency") || undefined;

  return {
    name,
    price: price !== undefined && !Number.isNaN(price) ? price : undefined,
    currency,
    image,
  };
}

export async function scrapeProduct(rawUrl: string): Promise<ScrapeResult> {
  const store = storeNameFromUrl(rawUrl);

  let url: URL;
  try {
    url = await assertPublicUrl(rawUrl);
  } catch {
    return {
      name: null,
      nameSource: "MANUAL",
      price: null,
      priceSource: "MANUAL",
      currency: "USD",
      imageUrl: null,
      store,
      warning: "URL no válida o no permitida",
    };
  }

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    const contentType = res.headers.get("content-type") ?? "";
    if (!res.ok || !contentType.includes("text/html")) {
      return {
        name: null,
        nameSource: "MANUAL",
        price: null,
        priceSource: "MANUAL",
        currency: "USD",
        imageUrl: null,
        store,
        warning: "No se pudo leer la página automáticamente",
      };
    }

    const reader = res.body?.getReader();
    let html = "";
    if (reader) {
      let received = 0;
      const decoder = new TextDecoder();
      while (received < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        html += decoder.decode(value, { stream: true });
      }
      reader.cancel().catch(() => {});
    } else {
      html = await res.text();
    }

    const $ = cheerio.load(html);

    const jsonLd = extractFromJsonLd($);
    const og = extractFromOpenGraph($);
    const titleFallback = $("title").first().text().trim() || undefined;

    const name = jsonLd.name || og.name || titleFallback || null;
    const nameSource: "AUTO" | "MANUAL" = jsonLd.name || og.name ? "AUTO" : "MANUAL";

    const price = jsonLd.price ?? og.price ?? null;
    const priceSource: "AUTO" | "MANUAL" = price !== null ? "AUTO" : "MANUAL";

    const imageUrl = jsonLd.image || og.image || null;
    const currency = (jsonLd.currency || og.currency || "USD").toUpperCase();

    return {
      name,
      nameSource,
      price,
      priceSource,
      currency,
      imageUrl,
      store,
      warning: price === null ? "No se pudo detectar el precio automáticamente" : undefined,
    };
  } catch {
    return {
      name: null,
      nameSource: "MANUAL",
      price: null,
      priceSource: "MANUAL",
      currency: "USD",
      imageUrl: null,
      store,
      warning: "No se pudo acceder al sitio",
    };
  }
}
