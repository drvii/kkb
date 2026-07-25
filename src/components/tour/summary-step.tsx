import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplitBreakdown } from "@/components/split-breakdown";
import { TOUR_SPLIT } from "@/lib/tour-fixture";

export function SummaryStep() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 px-4 py-4">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.02em]">{TOUR_SPLIT.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(TOUR_SPLIT.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
          </p>
        </div>

        <SplitBreakdown split={TOUR_SPLIT} />
      </div>

      <div className="flex items-center justify-between border-t border-border bg-background/95 px-4 py-3">
        <Button variant="outline" size="icon" tabIndex={-1} aria-hidden>
          <Download className="size-4" />
        </Button>
        <Button className="flex-1 font-semibold" tabIndex={-1}>
          Back to home
        </Button>
      </div>
    </div>
  );
}
