"use client";

import { useRef, useState, type RefObject } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { PersonBreakdown } from "@/components/person-breakdown";
import { formatPeso } from "@/lib/money";
import { receiptGrandTotal } from "@/lib/split-math";
import type { Split } from "@/lib/types";

/** Renders split to an off-screen snapshot and saves it as a PNG. Tolerates an as-yet-unloaded split. */
export function useSplitImageExport(split: Split | undefined) {
  const snapshotRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function save() {
    if (!split || !snapshotRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(snapshotRef.current, {
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

  return { snapshotRef, exporting, save };
}

/** Off-screen, fully-expanded render of a Split — the source element for useSplitImageExport. */
export function SplitExportSnapshot({
  split,
  snapshotRef,
}: {
  split: Split;
  snapshotRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="pointer-events-none fixed left-[-9999px] top-0" aria-hidden>
      <div ref={snapshotRef} className="flex w-[400px] flex-col gap-3 bg-background p-6">
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
  );
}
