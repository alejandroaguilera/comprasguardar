export async function createProductWithImage(
  payload: Record<string, unknown>,
  file: File | null,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return {
      ok: false,
      error: typeof data.error === "string" ? data.error : "No se pudo guardar el producto",
    };
  }

  const product = await res.json();

  if (file) {
    const formData = new FormData();
    formData.set("file", file);
    await fetch(`/api/products/${product.id}/image`, { method: "POST", body: formData });
  }

  return { ok: true, id: product.id };
}
