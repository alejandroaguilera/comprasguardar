"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CheckPriceButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);

    const res = await fetch(`/api/products/${productId}/check`, { method: "POST" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setMessage(data.error ?? "No se pudo revisar el precio");
    } else if (data.warning) {
      setMessage(data.warning);
    } else {
      setMessage(data.changed ? "Precio actualizado" : "Sin cambios");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-1 flex-col gap-1">
      <Button variant="outline" size="sm" onClick={handleClick} disabled={loading} className="w-full">
        <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
        Revisar precio
      </Button>
      {message && <p className="text-xs text-neutral-500 dark:text-neutral-400">{message}</p>}
    </div>
  );
}
