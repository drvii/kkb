"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/top-bar";
import { AppShell } from "@/components/app-shell";
import { PersonAvatar } from "@/components/person-avatar";
import { useDraftSplit } from "@/lib/store/draft-split";
import { useHistoryStore } from "@/lib/store/history";
import { formatPeso } from "@/lib/money";
import { receiptGrandTotal } from "@/lib/split-math";
import { eyebrowClass } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const startNew = useDraftSplit((s) => s.startNew);
  const recentSplits = useHistoryStore((s) => s.splits).slice(0, 3);

  function handleStart() {
    startNew();
    router.push("/new/people");
  }

  return (
    <AppShell>
      <TopBar />
      <main className="flex flex-1 flex-col justify-center gap-8 px-6 pb-16">
        <div className="flex flex-col gap-4">
          <p className={eyebrowClass}>Kanya-kanyang bayad</p>
          <h1 className="text-5xl leading-[1.02] font-extrabold text-balance tracking-[-0.035em]">
            Everyone pays their own.
          </h1>
        </div>

        <Button size="lg" className="h-13 w-full text-base font-bold" onClick={handleStart}>
          Start a new split
          <ArrowRight className="size-4" />
        </Button>

        {recentSplits.length > 0 && (
          <div className="flex flex-col gap-1 border-t pt-4">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Recent
              </span>
              <button
                type="button"
                onClick={() => router.push("/history")}
                className="font-mono text-[11px] font-semibold text-primary hover:underline"
              >
                All →
              </button>
            </div>
            {recentSplits.map((split) => (
              <button
                key={split.id}
                type="button"
                onClick={() => router.push(`/history/${split.id}`)}
                className="flex items-center justify-between gap-3 border-b py-3.5 text-left last:border-b-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    {split.people.slice(0, 4).map((p) => (
                      <PersonAvatar key={p.id} person={p} size="sm" className="ring-2 ring-background" />
                    ))}
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(split.createdAt)
                      .toLocaleDateString("en-PH", { month: "short", day: "2-digit" })
                      .toUpperCase()}{" "}
                    · {split.people.length} PAX
                  </span>
                </div>
                <span className="font-mono text-base font-bold">{formatPeso(receiptGrandTotal(split))}</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
