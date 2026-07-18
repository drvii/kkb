"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { path: "/new/receipt", label: "Receipt" },
  { path: "/new/people", label: "People" },
  { path: "/new/assign", label: "Assign" },
  { path: "/new/summary", label: "Summary" },
];

export function FlowStepper({ current }: { current: number }) {
  const router = useRouter();

  return (
    <nav className="flex items-center gap-1 px-4 pb-3 sm:px-6" aria-label="Split flow progress">
      {STEPS.map((step, index) => {
        const isPast = index < current;
        const isCurrent = index === current;
        const reachable = index <= current;
        return (
          <button
            key={step.path}
            type="button"
            disabled={!reachable}
            onClick={() => reachable && router.push(step.path)}
            className={cn(
              "flex flex-1 flex-col gap-1 text-left",
              reachable ? "cursor-pointer" : "cursor-not-allowed opacity-40",
            )}
          >
            <span
              className={cn(
                "h-1.5 rounded-full transition-colors",
                isCurrent || isPast ? "bg-primary" : "bg-muted",
              )}
            />
            <span
              className={cn(
                "text-xs",
                isCurrent ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
