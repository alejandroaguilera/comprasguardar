"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CURRENCIES } from "@/lib/currencies";
import { createProductWithImage } from "@/lib/save-product";

export function InStoreProductForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [store, setStore] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const file = fileInputRef.current?.files?.[0] ?? null;

    const result = await createProductWithImage(
      {
        type: "IN_STORE",
        name,
        nameSource: "MANUAL",
        price: Number(price),
        priceSource: "MANUAL",
        currency,
        imageUrl: file ? undefined : imageUrl.trim() || undefined,
        store: store.trim() || "Tienda física",
      },
      file,
    );

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="instore-name">Nombre del producto</Label>
        <Input id="instore-name" required autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="instore-price">Precio</Label>
          <Input
            id="instore-price"
            type="number"
            step="0.01"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="instore-currency">Moneda</Label>
          <Select id="instore-currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="instore-store">Tienda</Label>
        <Input
          id="instore-store"
          required
          placeholder="Ej. Walmart, Costco, tienda local..."
          value={store}
          onChange={(e) => setStore(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="instore-image-file">Foto del producto</Label>
        <Input id="instore-image-file" type="file" accept="image/*" capture="environment" ref={fileInputRef} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="instore-image-url">o pega una URL de imagen</Label>
        <Input
          id="instore-image-url"
          type="url"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Guardando..." : "Guardar producto"}
        </Button>
      </div>
    </form>
  );
}
