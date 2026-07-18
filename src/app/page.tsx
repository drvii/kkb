"use client";

import { useRouter } from "next/navigation";
import { Receipt, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/top-bar";
import { useDraftSplit } from "@/lib/store/draft-split";
import { useHistoryStore } from "@/lib/store/history";

export default function HomePage() {
  const router = useRouter();
  const startNew = useDraftSplit((s) => s.startNew);
  const historyCount = useHistoryStore((s) => s.splits.length);

  function handleStart() {
    startNew();
    router.push("/new/receipt");
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <TopBar showWordmark={false} />
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Receipt className="size-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Kanya-Kanyang Bayad</h1>
          <p className="max-w-xs text-balance text-muted-foreground">
            Digitize the receipt, assign items to the people at the table, and split the bill fairly.
          </p>
        </div>

        <Button size="lg" className="h-12 w-full max-w-xs text-base" onClick={handleStart}>
          Start splitting
        </Button>

        {historyCount > 0 && (
          <button
            type="button"
            onClick={() => router.push("/history")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <History className="size-3.5" />
            Recent splits
          </button>
        )}
      </main>
    </div>
  );
}
