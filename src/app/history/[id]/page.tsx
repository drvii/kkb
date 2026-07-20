"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/top-bar";
import { AppShell } from "@/components/app-shell";
import { SplitBreakdown } from "@/components/split-breakdown";
import { useHistoryStore } from "@/lib/store/history";
import { DEFAULT_SPLIT_NAME } from "@/lib/store/draft-split";

export default function HistorySplitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const split = useHistoryStore((s) => s.splits.find((sp) => sp.id === id));

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
          <h1 className="text-2xl font-extrabold tracking-[-0.02em]">{split.name || DEFAULT_SPLIT_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(split.createdAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })} ·
            read-only.
          </p>
        </div>

        <SplitBreakdown split={split} />
      </main>
    </AppShell>
  );
}
