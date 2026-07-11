"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Archive, LayoutGrid, LogOut, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (pathname === "/login") return null;

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ShoppingBag className="size-5" />
          ComprasGuardar
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800",
              pathname === "/" && "bg-neutral-100 dark:bg-neutral-800",
            )}
          >
            <LayoutGrid className="size-4" />
            Dashboard
          </Link>
          <Link
            href="/archived"
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800",
              pathname === "/archived" && "bg-neutral-100 dark:bg-neutral-800",
            )}
          >
            <Archive className="size-4" />
            Archivados
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="size-3.5" />
            Salir
          </Button>
        </nav>
      </div>
    </header>
  );
}
