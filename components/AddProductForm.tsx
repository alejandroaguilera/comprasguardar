"use client";

import { useState } from "react";
import { Globe, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { OnlineProductForm } from "@/components/OnlineProductForm";
import { InStoreProductForm } from "@/components/InStoreProductForm";

type Mode = "choose" | "online" | "in-store";

export function AddProductForm() {
  const [mode, setMode] = useState<Mode>("choose");

  return (
    <Card>
      <CardContent className="pt-5">
        {mode === "choose" && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setMode("online")}
              className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 text-left transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
            >
              <Globe className="size-6 shrink-0 text-neutral-500" />
              <div>
                <p className="font-medium">Compra en línea</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Pega el link de una tienda y detectamos nombre/precio automáticamente.
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode("in-store")}
              className="flex items-center gap-3 rounded-lg border border-neutral-200 p-4 text-left transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
            >
              <Store className="size-6 shrink-0 text-neutral-500" />
              <div>
                <p className="font-medium">Compra en tienda física</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Tómale una foto al producto y registra nombre, precio y tienda a mano.
                </p>
              </div>
            </button>
          </div>
        )}

        {mode === "online" && <OnlineProductForm onBack={() => setMode("choose")} />}
        {mode === "in-store" && <InStoreProductForm onBack={() => setMode("choose")} />}
      </CardContent>
    </Card>
  );
}
