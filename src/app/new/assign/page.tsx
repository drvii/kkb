"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { TopBar } from "@/components/top-bar";
import { FlowStepper } from "@/components/flow-stepper";
import { AppShell } from "@/components/app-shell";
import { PersonAvatar } from "@/components/person-avatar";
import { useDraftSplit } from "@/lib/store/draft-split";
import { formatPeso } from "@/lib/money";
import {
  allUnits,
  discountTargets,
  isFullyAssigned,
  isUnitAssigned,
  unitLabel,
  unitPrice,
  unitShareAmount,
} from "@/lib/split-math";
import type { Discount, Unit } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function AssignPage() {
  const router = useRouter();
  const split = useDraftSplit((s) => s.split);
  const toggleUnitPerson = useDraftSplit((s) => s.toggleUnitPerson);
  const updateDiscount = useDraftSplit((s) => s.updateDiscount);

  const [activePersonId, setActivePersonId] = useState<string | null>(null);
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [activeDiscountId, setActiveDiscountId] = useState<string | null>(null);

  useEffect(() => {
    if (split.people.length === 0) {
      router.replace("/new/people");
    } else if (split.items.length === 0) {
      router.replace("/new/receipt");
    }
  }, [split.items.length, split.people.length, router]);

  const units = allUnits(split.items);
  const canContinue = isFullyAssigned(split);
  const activePerson = split.people.find((p) => p.id === activePersonId) ?? null;

  function handleQuickTap(unit: Unit) {
    if (activePersonId) {
      toggleUnitPerson(unit.unitId, activePersonId);
    } else {
      setActiveUnit(unit);
    }
  }

  function handleDiscountQuickTap(discount: Discount) {
    if (!activePersonId) {
      setActiveDiscountId(discount.id);
      return;
    }
    // Tapping a person while a discount still applies to "everyone" narrows it to just that person —
    // the common case is attributing a PWD/Senior discount to the one diner who qualifies for it.
    const current = discount.appliesTo === "everyone" ? [] : discount.appliesTo;
    const next =
      discount.appliesTo === "everyone"
        ? [activePersonId]
        : current.includes(activePersonId)
          ? current.filter((id) => id !== activePersonId)
          : [...current, activePersonId];
    updateDiscount(discount.id, { appliesTo: next });
  }

  const activeAssignedIds = activeUnit ? (split.assignments[activeUnit.unitId] ?? []) : [];
  const activeDiscount = split.discounts.find((d) => d.id === activeDiscountId) ?? null;

  return (
    <AppShell>
      <TopBar />
      <FlowStepper current={2} />

      <main className="flex flex-1 flex-col gap-4 px-4 pb-28 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em]">Assign items</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activePerson
              ? `Tap what ${activePerson.name} had — tap again to remove.`
              : "Tap a person, then tap what they had. Tap the circle to edit a shared item."}
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {split.people.map((person) => {
            const active = activePersonId === person.id;
            return (
              <button
                key={person.id}
                type="button"
                onClick={() => setActivePersonId(active ? null : person.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border py-1.5 pr-3 pl-1.5 transition-colors",
                  active ? "border-primary bg-primary/10" : "border-border bg-card",
                )}
              >
                <PersonAvatar person={person} size="xs" />
                <span className={cn("text-sm font-semibold", active && "text-primary")}>{person.name}</span>
              </button>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-mono text-[10px] tracking-[0.08em] uppercase">Item</TableHead>
                <TableHead className="w-20 text-right font-mono text-[10px] tracking-[0.08em] uppercase">
                  Price
                </TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => {
                const assignedIds = split.assignments[unit.unitId] ?? [];
                const assignedPeople = split.people.filter((p) => assignedIds.includes(p.id));
                const quickAssigned = activePersonId !== null && assignedIds.includes(activePersonId);
                return (
                  <TableRow
                    key={unit.unitId}
                    className={cn(quickAssigned && "bg-primary/5")}
                  >
                    <TableCell
                      role="button"
                      tabIndex={0}
                      onClick={() => handleQuickTap(unit)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleQuickTap(unit);
                      }}
                      className="cursor-pointer whitespace-normal text-xs font-medium"
                    >
                      {unitLabel(unit)}
                    </TableCell>
                    <TableCell
                      role="button"
                      tabIndex={-1}
                      onClick={() => handleQuickTap(unit)}
                      className="cursor-pointer text-right font-mono text-xs text-muted-foreground"
                    >
                      {formatPeso(unitPrice(unit.item))}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        aria-label={`Edit who shares ${unitLabel(unit)}`}
                        disabled={activePersonId !== null}
                        onClick={() => setActiveUnit(unit)}
                        className={cn(activePersonId !== null && "pointer-events-none opacity-30")}
                      >
                        {assignedPeople.length > 0 ? (
                          <div className="flex -space-x-1.5">
                            {assignedPeople.map((p) => (
                              <PersonAvatar key={p.id} person={p} size="xs" className="ring-2 ring-background" />
                            ))}
                          </div>
                        ) : (
                          <span className="flex size-6 items-center justify-center rounded-full border border-dashed border-primary/40 text-primary">
                            <Plus className="size-3" />
                          </span>
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {split.discounts.length > 0 && (
          <div>
            <p className="mb-2 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
              Discounts
            </p>
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableBody>
                  {split.discounts.map((discount) => {
                    const isEveryone = discount.appliesTo === "everyone";
                    const targets = discountTargets(discount, split);
                    const targetedPeople = split.people.filter((p) => targets.includes(p.id));
                    const quickTargeted = activePersonId !== null && targets.includes(activePersonId);
                    return (
                      <TableRow key={discount.id} className={cn(quickTargeted && "bg-primary/5")}>
                        <TableCell
                          role="button"
                          tabIndex={0}
                          onClick={() => handleDiscountQuickTap(discount)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") handleDiscountQuickTap(discount);
                          }}
                          className="cursor-pointer whitespace-normal text-xs font-medium"
                        >
                          {discount.label || "Discount"}
                        </TableCell>
                        <TableCell
                          role="button"
                          tabIndex={-1}
                          onClick={() => handleDiscountQuickTap(discount)}
                          className="cursor-pointer text-right font-mono text-xs text-muted-foreground"
                        >
                          -{formatPeso(discount.amount)}
                        </TableCell>
                        <TableCell className="w-16">
                          <button
                            type="button"
                            aria-label={`Edit who ${discount.label || "this discount"} applies to`}
                            disabled={activePersonId !== null}
                            onClick={() => setActiveDiscountId(discount.id)}
                            className={cn(activePersonId !== null && "pointer-events-none opacity-30")}
                          >
                            {isEveryone ? (
                              <span className="text-[10px] whitespace-nowrap text-muted-foreground">Everyone</span>
                            ) : targetedPeople.length > 0 ? (
                              <div className="flex -space-x-1.5">
                                {targetedPeople.map((p) => (
                                  <PersonAvatar key={p.id} person={p} size="xs" className="ring-2 ring-background" />
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] whitespace-nowrap text-muted-foreground">Nobody</span>
                            )}
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>

      <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <span className="font-mono text-sm text-muted-foreground">
          {units.filter((u) => isUnitAssigned(split.assignments, u)).length}/{units.length} ASSIGNED
        </span>
        <Button disabled={!canContinue} onClick={() => router.push("/new/summary")}>
          Next
        </Button>
      </div>

      <Sheet open={activeUnit !== null} onOpenChange={(open) => !open && setActiveUnit(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl border-border">
          <SheetHeader>
            <SheetTitle>{activeUnit ? unitLabel(activeUnit) : ""}</SheetTitle>
            <SheetDescription className="font-mono">
              {activeUnit && formatPeso(unitPrice(activeUnit.item))}
              {activeAssignedIds.length > 1 &&
                activeUnit &&
                ` · split ${activeAssignedIds.length} ways = ${formatPeso(
                  unitShareAmount(activeUnit.item, activeAssignedIds.length),
                )} each`}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-4">
            {split.people.map((person) => {
              const checked = activeUnit ? (split.assignments[activeUnit.unitId] ?? []).includes(person.id) : false;
              return (
                <label
                  key={person.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 hover:bg-accent"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => activeUnit && toggleUnitPerson(activeUnit.unitId, person.id)}
                  />
                  <PersonAvatar person={person} size="sm" />
                  <span className="flex-1 font-medium">{person.name}</span>
                </label>
              );
            })}
          </div>
          <SheetFooter>
            <Button onClick={() => setActiveUnit(null)} className="w-full">
              Done
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={activeDiscountId !== null} onOpenChange={(open) => !open && setActiveDiscountId(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl border-border">
          <SheetHeader>
            <SheetTitle>{activeDiscount ? activeDiscount.label || "Discount" : ""} applies to</SheetTitle>
            <SheetDescription className="font-mono">
              {activeDiscount && `-${formatPeso(activeDiscount.amount)}`}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 hover:bg-accent">
              <Checkbox
                checked={activeDiscount?.appliesTo === "everyone"}
                onCheckedChange={() => activeDiscountId && updateDiscount(activeDiscountId, { appliesTo: "everyone" })}
              />
              <span className="flex-1 font-medium">Everyone</span>
            </label>
            <div className="my-1 border-t border-border" />
            {split.people.map((person) => {
              const checked =
                activeDiscount !== null &&
                activeDiscount.appliesTo !== "everyone" &&
                activeDiscount.appliesTo.includes(person.id);
              return (
                <label
                  key={person.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 hover:bg-accent"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => {
                      if (!activeDiscountId || !activeDiscount) return;
                      const current = activeDiscount.appliesTo === "everyone" ? [] : activeDiscount.appliesTo;
                      const next = current.includes(person.id)
                        ? current.filter((id) => id !== person.id)
                        : [...current, person.id];
                      updateDiscount(activeDiscountId, { appliesTo: next });
                    }}
                  />
                  <PersonAvatar person={person} size="sm" />
                  <span className="flex-1 font-medium">{person.name}</span>
                </label>
              );
            })}
          </div>
          <SheetFooter>
            <Button onClick={() => setActiveDiscountId(null)} className="w-full">
              Done
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
