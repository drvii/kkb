"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TopBar } from "@/components/top-bar";
import { AppShell } from "@/components/app-shell";
import { PersonBreakdown } from "@/components/person-breakdown";
import { useHistoryStore } from "@/lib/store/history";
import { formatPeso } from "@/lib/money";
import { receiptGrandTotal, receiptSubtotal } from "@/lib/split-math";

export default function HistorySplitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const split = useHistoryStore((s) => s.splits.find((sp) => sp.id === id));
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(personId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(personId)) {
        next.delete(personId);
      } else {
        next.add(personId);
      }
      return next;
    });
  }

  if (!split) {
    return (
      <AppShell>
        <TopBar />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-muted-foreground">This split isn&apos;t saved on this device (anymore).</p>
          <Button variant="outline" onClick={() => router.push("/history")}>
            Back to recent splits
          </Button>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar />

      <main className="flex flex-1 flex-col gap-6 px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={() => router.push("/history")}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Recent splits
        </button>

        <div>
          <h1 className="text-xl font-semibold">
            {new Date(split.createdAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
          </h1>
          <p className="text-sm text-muted-foreground">Read-only — start a new split to make changes.</p>
        </div>

        <ul className="flex flex-col gap-2">
          {split.people.map((person) => (
            <li key={person.id}>
              <PersonBreakdown
                split={split}
                person={person}
                expanded={expanded.has(person.id)}
                onToggle={() => toggle(person.id)}
              />
            </li>
          ))}
        </ul>

        <Card>
          <CardContent className="flex flex-col gap-1.5 py-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPeso(receiptSubtotal(split.items))}</span>
            </div>
            {split.charges.serviceCharge > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Service charge</span>
                <span>{formatPeso(split.charges.serviceCharge)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-1.5 font-semibold">
              <span>Total</span>
              <span>{formatPeso(receiptGrandTotal(split))}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </AppShell>
  );
}
