import { PersonBreakdown } from "@/components/person-breakdown";
import { formatPeso } from "@/lib/money";
import { receiptGrandTotal } from "@/lib/split-math";
import { TOUR_SPLIT } from "@/lib/tour-fixture";

/** Mirrors the composition SplitExportSnapshot renders off-screen for the real PNG export. */
export function ExportStep() {
  return (
    <div className="flex flex-col gap-3 bg-background p-5">
      <h2 className="text-lg font-bold">{TOUR_SPLIT.name}</h2>
      <ul className="flex flex-col gap-2">
        {TOUR_SPLIT.people.map((person) => (
          <li key={person.id}>
            <PersonBreakdown split={TOUR_SPLIT} person={person} expanded />
          </li>
        ))}
      </ul>
      <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
        <span>Total</span>
        <span>{formatPeso(receiptGrandTotal(TOUR_SPLIT))}</span>
      </div>
    </div>
  );
}
