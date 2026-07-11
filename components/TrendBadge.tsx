import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

type TrendBadgeProps = {
  current: number;
  previous?: number;
  currency: string;
};

export function TrendBadge({ current, previous, currency }: TrendBadgeProps) {
  if (previous === undefined) {
    return (
      <Badge variant="secondary">
        <Minus className="size-3" />
        Nuevo
      </Badge>
    );
  }

  const diff = current - previous;

  if (diff === 0) {
    return (
      <Badge variant="secondary">
        <Minus className="size-3" />
        Sin cambio
      </Badge>
    );
  }

  if (diff < 0) {
    return (
      <Badge variant="good">
        <ArrowDown className="size-3" />
        Bajó {formatPrice(Math.abs(diff), currency)}
      </Badge>
    );
  }

  return (
    <Badge variant="critical">
      <ArrowUp className="size-3" />
      Subió {formatPrice(diff, currency)}
    </Badge>
  );
}
