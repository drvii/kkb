"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2Icon, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TopBar } from "@/components/top-bar";
import { FlowStepper } from "@/components/flow-stepper";
import { AppShell } from "@/components/app-shell";
import { SplitBreakdown } from "@/components/split-breakdown";
import { SplitExportSnapshot, useSplitImageExport } from "@/components/split-export";
import { useDraftSplit } from "@/lib/store/draft-split";
import { useHistoryStore } from "@/lib/store/history";
import { isFullyAssigned } from "@/lib/split-math";

export default function SummaryPage() {
  const router = useRouter();
  const split = useDraftSplit((s) => s.split);
  const setName = useDraftSplit((s) => s.setName);
  const togglePaid = useDraftSplit((s) => s.togglePaid);
  const upsertHistory = useHistoryStore((s) => s.upsert);
  const { snapshotRef, exporting, save: handleSaveImage } = useSplitImageExport(split);

  useEffect(() => {
    if (!isFullyAssigned(split)) {
      router.replace("/new/assign");
      return;
    }
    upsertHistory(split);
  }, [split, upsertHistory, router]);

  function handleBackToHome() {
    router.push("/");
  }

  if (!isFullyAssigned(split)) return null;

  return (
    <AppShell>
      <TopBar />
      <FlowStepper current={3} />

      <main className="flex flex-1 flex-col gap-5 px-4 pb-28 sm:px-6">
        <div>
          <div className="relative inline-block w-fit max-w-full">
            <Input
              value={split.name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Split name"
              className="field-sizing-content h-auto w-auto min-w-0 max-w-full rounded-md border-none bg-transparent px-0 py-0.5 pr-6 text-2xl font-bold tracking-[-0.02em] shadow-none focus-visible:ring-0 md:text-1xl dark:bg-transparent"
            />
            <SquarePen className="pointer-events-none absolute right-0 bottom-1 size-3.5 text-muted-foreground/50" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(split.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
          </p>
        </div>

        <SplitBreakdown split={split} onTogglePaid={togglePaid} />
      </main>

      <SplitExportSnapshot split={split} snapshotRef={snapshotRef} />

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <Button
          variant="outline"
          size="icon"
          aria-label={exporting ? "Saving…" : "Save image"}
          onClick={handleSaveImage}
          disabled={exporting}
        >
          {exporting ? <Loader2Icon className="size-4 animate-spin" /> : <Download className="size-4" />}
        </Button>
        <Button className="flex-1 font-semibold" onClick={handleBackToHome}>
          Back to home
        </Button>
      </div>
    </AppShell>
  );
}
