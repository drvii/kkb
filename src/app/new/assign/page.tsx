"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { TopBar } from "@/components/top-bar";
import { FlowStepper } from "@/components/flow-stepper";
import { AppShell } from "@/components/app-shell";
import { PersonAvatar } from "@/components/person-avatar";
import { useDraftSplit } from "@/lib/store/draft-split";
import { formatPeso } from "@/lib/money";
import { allUnits, isFullyAssigned, isUnitAssigned, unitPrice } from "@/lib/split-math";
import type { Unit } from "@/lib/types";

export default function AssignPage() {
  const router = useRouter();
  const split = useDraftSplit((s) => s.split);
  const toggleUnitPerson = useDraftSplit((s) => s.toggleUnitPerson);

  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);

  useEffect(() => {
    if (split.items.length === 0) {
      router.replace("/new/receipt");
    } else if (split.people.length === 0) {
      router.replace("/new/people");
    }
  }, [split.items.length, split.people.length, router]);

  const units = allUnits(split.items);
  const canContinue = isFullyAssigned(split);

  return (
    <AppShell>
      <TopBar />
      <FlowStepper current={2} />

      <main className="flex flex-1 flex-col gap-4 px-4 pb-28 sm:px-6">
        <div>
          <h1 className="text-xl font-semibold">Assign items</h1>
          <p className="text-sm text-muted-foreground">
            Tap an item to assign it to whoever ordered it — select more than one person if it was shared.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Item</TableHead>
                <TableHead className="w-20 text-right">Price</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => {
                const assignedIds = split.assignments[unit.unitId] ?? [];
                const assignedPeople = split.people.filter((p) => assignedIds.includes(p.id));
                return (
                  <TableRow
                    key={unit.unitId}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveUnit(unit)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setActiveUnit(unit);
                    }}
                    className="cursor-pointer"
                  >
                    <TableCell className="whitespace-normal font-medium">
                      {unit.item.quantity > 1
                        ? `${unit.item.name} (${unit.index + 1}/${unit.item.quantity})`
                        : unit.item.name}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatPeso(unitPrice(unit.item))}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </main>

      <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <span className="text-sm text-muted-foreground">
          {units.filter((u) => isUnitAssigned(split.assignments, u)).length}/{units.length} assigned
        </span>
        <Button disabled={!canContinue} onClick={() => router.push("/new/summary")}>
          Next
        </Button>
      </div>

      <Dialog open={activeUnit !== null} onOpenChange={(open) => !open && setActiveUnit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeUnit
                ? activeUnit.item.quantity > 1
                  ? `${activeUnit.item.name} (${activeUnit.index + 1}/${activeUnit.item.quantity})`
                  : activeUnit.item.name
                : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1">
            {split.people.map((person) => {
              const checked = activeUnit ? (split.assignments[activeUnit.unitId] ?? []).includes(person.id) : false;
              return (
                <label
                  key={person.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-accent"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => activeUnit && toggleUnitPerson(activeUnit.unitId, person.id)}
                  />
                  <PersonAvatar person={person} size="sm" />
                  <span className="flex-1">{person.name}</span>
                </label>
              );
            })}
          </div>
          <DialogFooter>
            <Button onClick={() => setActiveUnit(null)} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
