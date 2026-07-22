"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/top-bar";
import { AppShell } from "@/components/app-shell";
import { PersonAvatar } from "@/components/person-avatar";
import { useDraftSplit, DEFAULT_SPLIT_NAME } from "@/lib/store/draft-split";
import { useHistoryStore } from "@/lib/store/history";
import { formatPeso } from "@/lib/money";
import { receiptGrandTotal } from "@/lib/split-math";

const WORDMARK_CHARS = ["k", "k", "b", "."];

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
      <main className="flex flex-1 flex-col justify-center gap-10 px-6 pb-16">
        <div className="flex flex-col gap-3">
          <p className="font-wordmark text-6xl font-bold tracking-[-0.03em]">
            {WORDMARK_CHARS.map((char, i) => (
              <span
                key={i}
                className={`animate-letter-pop inline-block ${i === 3 ? "text-primary" : ""}`}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {char}
              </span>
            ))}
          </p>
          <p className="max-w-[34ch] text-balance text-muted-foreground">
            Split any restaurant bill fairly — enter the receipt, assign what everyone had, and see exactly who owes
            what.
          </p>
        </div>

        <Button size="lg" className="h-13 w-full text-base font-semibold" onClick={handleStart}>
          Start a new split
          <ArrowRight className="size-4" />
        </Button>

        {recentSplits.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-border pt-5">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Recent
              </span>
              <button
                type="button"
                onClick={() => router.push("/history")}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                All →
              </button>
            </div>
            {recentSplits.map((split) => (
              <button
                key={split.id}
                type="button"
                onClick={() => router.push(`/history/${split.id}`)}
                className="flex flex-col gap-1.5 border-b border-border py-3.5 text-left last:border-b-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold">
                    {split.name || DEFAULT_SPLIT_NAME}
                  </span>
                  <span className="font-mono text-sm font-semibold">{formatPeso(receiptGrandTotal(split))}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    {split.people.slice(0, 4).map((p) => (
                      <PersonAvatar key={p.id} person={p} size="xs" className="ring-2 ring-background" />
                    ))}
                  </div>
                  <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                    {new Date(split.createdAt)
                      .toLocaleDateString("en-PH", { month: "short", day: "2-digit" })
                      .toUpperCase()}{" "}
                    ·
                    <Users className="size-3" />
                    {split.people.length}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
