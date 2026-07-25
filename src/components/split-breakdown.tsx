"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PersonBreakdown } from "@/components/person-breakdown";
import { formatPeso } from "@/lib/money";
import { receiptGrandTotal, receiptSubtotal } from "@/lib/split-math";
import type { Split } from "@/lib/types";

export function SplitBreakdown({
  split,
  onTogglePaid,
}: {
  split: Split;
  onTogglePaid?: (personId: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-2">
        {split.people.map((person) => (
          <li key={person.id}>
            <PersonBreakdown
              split={split}
              person={person}
              expanded={expanded.has(person.id)}
              onToggle={() => toggle(person.id)}
              onTogglePaid={onTogglePaid && (() => onTogglePaid(person.id))}
            />
          </li>
        ))}
      </ul>

      <Card>
        <CardContent className="flex flex-col gap-1.5 py-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono">{formatPeso(receiptSubtotal(split.items))}</span>
          </div>
          {split.charges.serviceCharge > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Service charge</span>
              <span className="font-mono">{formatPeso(split.charges.serviceCharge)}</span>
            </div>
          )}
          {split.discounts.map((discount) => (
            <div key={discount.id} className="flex justify-between text-muted-foreground">
              <span>{discount.label || "Discount"}</span>
              <span className="font-mono">-{formatPeso(discount.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-1.5 font-bold">
            <span>Total</span>
            <span className="font-mono">{formatPeso(receiptGrandTotal(split))}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
