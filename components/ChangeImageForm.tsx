"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ChangeImageForm({
  productId,
  hasImage,
}: {
  productId: string;
  hasImage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const file = fileInputRef.current?.files?.[0];

    if (!file && !url.trim()) {
      setError("Sube un archivo o pega una URL de imagen");
      return;
    }

    setLoading(true);

    const res = file
      ? await fetch(`/api/products/${productId}/image`, {
          method: "POST",
          body: (() => {
            const formData = new FormData();
            formData.set("file", file);
            return formData;
          })(),
        })
      : await fetch(`/api/products/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url.trim() }),
        });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "No se pudo actualizar la imagen");
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    setUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleRemove() {
    setLoading(true);
    await fetch(`/api/products/${productId}/image`, { method: "DELETE" });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ImagePlus className="size-3.5" />
          {hasImage ? "Cambiar imagen" : "Agregar imagen"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{hasImage ? "Cambiar imagen" : "Agregar imagen"}</DialogTitle>
          <DialogDescription>Sube un archivo o pega la URL de una imagen.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="image-file">Subir archivo</Label>
            <Input id="image-file" type="file" accept="image/*" ref={fileInputRef} />
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            o
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="image-url">URL de la imagen</Label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <DialogFooter className="justify-between sm:justify-between">
            {hasImage ? (
              <Button type="button" variant="ghost" onClick={handleRemove} disabled={loading}>
                Quitar imagen
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
