"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TopBar } from "@/components/top-bar";
import { AppShell } from "@/components/app-shell";
import { SplitBreakdown } from "@/components/split-breakdown";
import { useHistoryStore } from "@/lib/store/history";
import { useDraftSplit, DEFAULT_SPLIT_NAME } from "@/lib/store/draft-split";

export default function HistorySplitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const split = useHistoryStore((s) => s.splits.find((sp) => sp.id === id));
  const renameSplit = useHistoryStore((s) => s.renameSplit);
  const draft = useDraftSplit((s) => s.split);
  const startFrom = useDraftSplit((s) => s.startFrom);

  const [confirmOpen, setConfirmOpen] = useState(false);

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

  function rebuild() {
    if (!split) return;
    startFrom(split);
    router.push("/new/receipt");
  }

  function handleRebuildClick() {
    const draftInProgress = draft.items.length > 0 || draft.people.length > 0;
    if (draftInProgress) {
      setConfirmOpen(true);
    } else {
      rebuild();
    }
  }

  return (
    <AppShell>
      <TopBar />

      <main className="flex flex-1 flex-col gap-6 px-4 py-4 pb-24 sm:px-6">
        <button
          type="button"
          onClick={() => router.push("/history")}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Recent splits
        </button>

        <div>
          <div className="relative inline-block w-fit max-w-full">
            <Input
              value={split.name}
              onChange={(e) => renameSplit(split.id, e.target.value)}
              aria-label="Split name"
              className="field-sizing-content h-auto w-auto min-w-0 max-w-full rounded-md border-none bg-transparent px-0 py-0.5 pr-6 text-2xl font-bold tracking-[-0.02em] shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
            <SquarePen className="pointer-events-none absolute right-0 bottom-1 size-3.5 text-muted-foreground/50" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(split.createdAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>

        <SplitBreakdown split={split} />
      </main>

      <div className="sticky bottom-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <Button className="w-full font-semibold" onClick={handleRebuildClick}>
          <RotateCcw className="size-4" />
          Rebuild
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard split in progress?</AlertDialogTitle>
            <AlertDialogDescription>
              You have an unfinished split (&quot;{draft.name || DEFAULT_SPLIT_NAME}&quot;). Rebuilding from this one
              will replace it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={rebuild}>Rebuild</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
