"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Download, Loader2Icon, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TopBar } from "@/components/top-bar";
import { FlowStepper } from "@/components/flow-stepper";
import { AppShell } from "@/components/app-shell";
import { PersonBreakdown } from "@/components/person-breakdown";
import { SplitBreakdown } from "@/components/split-breakdown";
import { useDraftSplit } from "@/lib/store/draft-split";
import { useHistoryStore } from "@/lib/store/history";
import { formatPeso } from "@/lib/money";
import { isFullyAssigned, receiptGrandTotal } from "@/lib/split-math";

export default function SummaryPage() {
  const router = useRouter();
  const split = useDraftSplit((s) => s.split);
  const setName = useDraftSplit((s) => s.setName);
  const upsertHistory = useHistoryStore((s) => s.upsert);

  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFullyAssigned(split)) {
      router.replace("/new/assign");
      return;
    }
    upsertHistory(split);
  }, [split, upsertHistory, router]);

  async function handleSaveImage() {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 3,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
      });
      const link = document.createElement("a");
      link.download = `kkb-split-${split.id.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error("Couldn't save the image. Please try again.");
    } finally {
      setExporting(false);
    }
  }

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
              className="field-sizing-content h-auto w-auto min-w-0 max-w-full border-none bg-transparent px-0 py-0.5 pr-6 text-2xl font-semibold tracking-[-0.02em] shadow-none focus-visible:ring-0 md:text-1xl dark:bg-transparent"
            />
            <SquarePen className="pointer-events-none absolute right-0 bottom-1 size-3.5 text-muted-foreground/50" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(split.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
          </p>
        </div>

        <SplitBreakdown split={split} />
      </main>

      {/* Off-screen export snapshot: forced fully-expanded per person */}
      <div className="pointer-events-none fixed left-[-9999px] top-0" aria-hidden>
        <div ref={exportRef} className="flex w-[400px] flex-col gap-3 bg-background p-6">
          <h2 className="text-lg font-bold">{split.name}</h2>
          <ul className="flex flex-col gap-2">
            {split.people.map((person) => (
              <li key={person.id}>
                <PersonBreakdown split={split} person={person} expanded />
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t pt-2 text-sm font-semibold">
            <span>Total</span>
            <span>{formatPeso(receiptGrandTotal(split))}</span>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <Button size="icon" aria-label={exporting ? "Saving…" : "Save image"} onClick={handleSaveImage} disabled={exporting}>
          {exporting ? <Loader2Icon className="size-4 animate-spin" /> : <Download className="size-4" />}
        </Button>
        <Button className="font-bold" onClick={handleBackToHome}>
          Back to home
        </Button>
      </div>
    </AppShell>
  );
}
