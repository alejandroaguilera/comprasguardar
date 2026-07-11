"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ArchiveButton({ productId, archived }: { productId: string; archived: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: !archived }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      {archived ? <ArchiveRestore className="size-3.5" /> : <Archive className="size-3.5" />}
      {archived ? "Reactivar" : "Archivar"}
    </Button>
  );
}
