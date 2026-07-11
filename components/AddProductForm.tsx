"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CURRENCIES, isKnownCurrency } from "@/lib/currencies";

type ScrapeResult = {
  name: string | null;
  nameSource: "AUTO" | "MANUAL";
  price: number | null;
  priceSource: "AUTO" | "MANUAL";
  currency: string;
  imageUrl: string | null;
  store: string;
  warning?: string;
};

function SourceBadge({ source }: { source: "AUTO" | "MANUAL" }) {
  return (
    <Badge variant={source === "AUTO" ? "good" : "secondary"}>
      {source === "AUTO" ? "Auto-detectado" : "Manual"}
    </Badge>
  );
}

export function AddProductForm() {
  const router = useRouter();
  const [step, setStep] = useState<"url" | "confirm">("url");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [preview, setPreview] = useState<ScrapeResult | null>(null);
  const [name, setName] = useState("");
  const [nameSource, setNameSource] = useState<"AUTO" | "MANUAL">("MANUAL");
  const [price, setPrice] = useState("");
  const [priceSource, setPriceSource] = useState<"AUTO" | "MANUAL">("MANUAL");
  const [currency, setCurrency] = useState("USD");
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFetch(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data: ScrapeResult = await res.json();
    if (!res.ok) {
      setError("No se pudo procesar el link");
      setLoading(false);
      return;
    }

    setPreview(data);
    setName(data.name ?? "");
    setNameSource(data.nameSource);
    setPrice(data.price !== null ? String(data.price) : "");
    setPriceSource(data.priceSource);
    setCurrency(isKnownCurrency(data.currency) ? data.currency : "USD");
    setImageUrl(data.imageUrl ?? "");
    setStep("confirm");
    setLoading(false);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const file = fileInputRef.current?.files?.[0];

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        name,
        nameSource,
        price: Number(price),
        priceSource,
        currency,
        imageUrl: file ? undefined : imageUrl.trim() || undefined,
        store: preview?.store ?? "Desconocido",
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "No se pudo guardar el producto");
      setLoading(false);
      return;
    }

    const product = await res.json();

    if (file) {
      const formData = new FormData();
      formData.set("file", file);
      await fetch(`/api/products/${product.id}/image`, { method: "POST", body: formData });
    }

    router.push("/");
    router.refresh();
  }

  if (step === "url") {
    return (
      <Card>
        <CardContent className="pt-5">
          <form onSubmit={handleFetch} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="product-url">Link del producto</Label>
              <Input
                id="product-url"
                type="url"
                placeholder="https://www.bestbuy.com/..."
                required
                autoFocus
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Buscando..." : "Buscar producto"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {preview?.warning && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {preview.warning}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="product-name">Nombre</Label>
              <SourceBadge source={nameSource} />
            </div>
            <Input
              id="product-name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameSource("MANUAL");
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="product-price">Precio</Label>
                <SourceBadge source={priceSource} />
              </div>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setPriceSource("MANUAL");
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="product-currency">Moneda</Label>
              <Select
                id="product-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="product-image-url">Imagen (URL)</Label>
            <Input
              id="product-image-url"
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="product-image-file">o sube un archivo</Label>
            <Input id="product-image-file" type="file" accept="image/*" ref={fileInputRef} />
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">Tienda: {preview?.store}</p>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep("url")}>
              Volver
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Guardando..." : "Guardar producto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
