"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const OTHER_VALUE = "__other__";

export function StoreField({
  id,
  value,
  onChange,
  required,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const [stores, setStores] = useState<string[]>([]);
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    fetch("/api/stores")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { name: string }[]) => setStores(data.map((s) => s.name)))
      .catch(() => {});
  }, []);

  if (addingNew) {
    return (
      <div className="flex gap-2">
        <Input
          id={id}
          autoFocus
          required={required}
          placeholder="Nombre de la tienda"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setAddingNew(false)}
          className="shrink-0 text-sm text-neutral-500 hover:underline"
        >
          Elegir de la lista
        </button>
      </div>
    );
  }

  const options = value && !stores.includes(value) ? [value, ...stores] : stores;

  return (
    <Select
      id={id}
      required={required}
      value={value}
      onChange={(e) => {
        if (e.target.value === OTHER_VALUE) {
          setAddingNew(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
    >
      {!value && <option value="">Selecciona una tienda...</option>}
      {options.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
      <option value={OTHER_VALUE}>Otra (agregar nueva)...</option>
    </Select>
  );
}
