"use client";

import { useRouter } from "next/navigation";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/top-bar";
import { AppShell } from "@/components/app-shell";
import { useDraftSplit } from "@/lib/store/draft-split";
import { useHistoryStore } from "@/lib/store/history";

const STARS = [
  { char: "*", top: "14%", left: "12%", size: "text-lg", rotate: "rotate-12", opacity: "text-muted-foreground/30" },
  { char: "✦", top: "22%", left: "82%", size: "text-2xl", rotate: "-rotate-12", opacity: "text-muted-foreground/20" },
  { char: "✳", top: "72%", left: "16%", size: "text-sm", rotate: "rotate-6", opacity: "text-muted-foreground/30" },
  { char: "*", top: "68%", left: "85%", size: "text-xl", rotate: "-rotate-6", opacity: "text-muted-foreground/20" },
  { char: "✧", top: "40%", left: "6%", size: "text-base", rotate: "rotate-3", opacity: "text-muted-foreground/20" },
];

export default function HomePage() {
  const router = useRouter();
  const startNew = useDraftSplit((s) => s.startNew);
  const historyCount = useHistoryStore((s) => s.splits.length);

  function handleStart() {
    startNew();
    router.push("/new/receipt");
  }

  return (
    <AppShell>
      <TopBar showWordmark={false} />
      <main className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center">
        {STARS.map((star, i) => (
          <span
            key={i}
            aria-hidden
            style={{ top: star.top, left: star.left }}
            className={`pointer-events-none absolute font-mono select-none ${star.size} ${star.rotate} ${star.opacity}`}
          >
            {star.char}
          </span>
        ))}

        <div className="relative flex flex-col items-center gap-3">
          <h1 className="animate-in text-2xl font-semibold tracking-tight fade-in-0 slide-in-from-bottom-2 duration-700">
            kkb<span className="text-primary">.</span>
          </h1>

          <p className="animate-in max-w-xs text-balance text-sm text-muted-foreground fade-in-0 slide-in-from-bottom-2 duration-700 delay-150">
            Scan or enter the receipt, tap who had what, and everyone knows exactly what they owe.
          </p>
        </div>

        <Button
          size="lg"
          className="h-12 w-full max-w-xs animate-in text-base fade-in-0 slide-in-from-bottom-2 duration-700 delay-300"
          onClick={handleStart}
        >
          Get started
        </Button>

        {historyCount > 0 && (
          <button
            type="button"
            onClick={() => router.push("/history")}
            className="relative inline-flex animate-in items-center gap-1.5 text-sm text-muted-foreground fade-in-0 underline-offset-4 duration-700 delay-500 hover:text-foreground hover:underline"
          >
            <History className="size-3.5" />
            Recent splits
          </button>
        )}
      </main>
    </AppShell>
  );
}
