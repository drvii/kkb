"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";
import { TopBar } from "@/components/top-bar";
import { StepFrame } from "@/components/tour/step-frame";
import { PeopleStep } from "@/components/tour/people-step";
import { ReceiptStep } from "@/components/tour/receipt-step";
import { AssignStep } from "@/components/tour/assign-step";
import { SummaryStep } from "@/components/tour/summary-step";
import { ExportStep } from "@/components/tour/export-step";

export default function TourPage() {
  const storyboardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  async function handleSaveImage() {
    if (!storyboardRef.current) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(storyboardRef.current, {
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
      });
      const link = document.createElement("a");
      link.download = "kkb-tour.png";
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error("Couldn't save the image. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <TopBar />

      <div className="flex items-start justify-between gap-3 px-4 pt-8 pb-6 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">How a split comes together</h1>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground"
          onClick={handleSaveImage}
          disabled={saving}
          aria-label={saving ? "Saving…" : "Save image"}
        >
          {saving ? <Loader2Icon className="size-4 animate-spin" /> : <Download className="size-4" />}
        </Button>
      </div>

      <main ref={storyboardRef} className="flex flex-1 flex-col gap-8 px-4 pb-16 sm:px-6">
        <StepFrame step={1} title="Add everyone at the table" caption="No accounts, no invites — just names.">
          <PeopleStep />
        </StepFrame>
        <StepFrame
          step={2}
          title="Scan the receipt"
          caption="Snap a photo. AI reads every item, the service charge, even discounts."
        >
          <ReceiptStep />
        </StepFrame>
        <StepFrame
          step={3}
          title="Tap who had what"
          caption="Shared plates split evenly, automatically — no mental math."
        >
          <AssignStep />
        </StepFrame>
        <StepFrame
          step={4}
          title="Get the exact total, per person"
          caption="Service charge and discounts already worked in."
        >
          <SummaryStep />
        </StepFrame>
        <StepFrame step={5} title="Save it, send it" caption="One tap saves the split as an image for the group chat.">
          <ExportStep />
        </StepFrame>
      </main>
    </AppShell>
  );
}
