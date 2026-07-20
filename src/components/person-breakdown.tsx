import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PersonAvatar } from "@/components/person-avatar";
import { formatPeso } from "@/lib/money";
import { chargeShare, personLineItems, personTotal } from "@/lib/split-math";
import type { Person, Split } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PersonBreakdown({
  split,
  person,
  expanded,
  onToggle,
}: {
  split: Split;
  person: Person;
  expanded: boolean;
  onToggle?: () => void;
}) {
  const lines = personLineItems(split, person.id);
  const charge = chargeShare(split);
  const total = personTotal(split, person.id);
  const hasCharges = split.charges.serviceCharge > 0;

  return (
    <Card size="sm">
      <CardContent>
        <button
          type="button"
          onClick={onToggle}
          disabled={!onToggle}
          className="flex w-full items-center gap-2 text-left disabled:cursor-default"
        >
          <PersonAvatar person={person} size="sm" />
          <span className="flex-1 truncate text-sm font-semibold">{person.name}</span>
          <span className="font-mono text-sm font-bold">{formatPeso(total)}</span>
          {onToggle && (
            <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", expanded && "rotate-180")} />
          )}
        </button>
        {expanded && (
          <div className="mt-2 flex flex-col gap-1 border-t pt-2 text-xs">
            {lines.map((line) => (
              <div key={line.unit.unitId} className="flex justify-between text-muted-foreground">
                <span>
                  {line.label}
                  {line.shared ? ` (shared ×${line.shareCount})` : ""}
                </span>
                <span className="font-mono">{formatPeso(line.amount)}</span>
              </div>
            ))}
            {hasCharges && (
              <div className="flex justify-between text-muted-foreground">
                <span>Service charge (equal share)</span>
                <span className="font-mono">{formatPeso(charge)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
