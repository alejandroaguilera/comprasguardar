import { Globe, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function StoreBadge({
  type,
  store,
  className,
}: {
  type: "ONLINE" | "IN_STORE";
  store: string;
  className?: string;
}) {
  return (
    <Badge variant="secondary" className={className}>
      {type === "ONLINE" ? <Globe className="size-3" /> : <Store className="size-3" />}
      {store}
    </Badge>
  );
}
