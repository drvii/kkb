"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { path: "/new/people", label: "People" },
  { path: "/new/receipt", label: "Receipt" },
  { path: "/new/assign", label: "Assign" },
  { path: "/new/summary", label: "Split" },
];

export function FlowStepper({ current }: { current: number }) {
  const router = useRouter();

  return (
    <nav className="flex items-center gap-1.5 px-4 pb-5 sm:px-6" aria-label="Split flow progress">
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
              "flex flex-1 flex-col gap-1.5 text-left",
              reachable ? "cursor-pointer" : "cursor-not-allowed opacity-40",
            )}
          >
            <span
              className={cn(
                "h-1 rounded-full transition-colors",
                isCurrent || isPast ? "bg-primary" : "bg-muted",
              )}
            />
            <span
              className={cn(
                "font-mono text-[10px] tracking-[0.05em] uppercase",
                isCurrent ? "font-semibold text-foreground" : "text-muted-foreground/70",
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
