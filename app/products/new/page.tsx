import { AddProductForm } from "@/components/AddProductForm";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold">Agregar producto</h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Pega el link del producto. Intentaremos detectar el nombre y el precio automáticamente.
      </p>
      <AddProductForm />
    </div>
  );
}
