import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PersonAvatar } from "@/components/person-avatar";
import { formatPeso } from "@/lib/money";
import { allUnits, discountTargets, isUnitAssigned, unitLabel, unitPrice } from "@/lib/split-math";
import { TOUR_ACTIVE_PERSON_ID, TOUR_ASSIGN_SPLIT } from "@/lib/tour-fixture";
import { cn } from "@/lib/utils";

export function AssignStep() {
  const split = TOUR_ASSIGN_SPLIT;
  const units = allUnits(split.items);
  const assignedCount = units.filter((u) => isUnitAssigned(split.assignments, u)).length;
  const activePerson = split.people.find((p) => p.id === TOUR_ACTIVE_PERSON_ID)!;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 px-4 py-4">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.02em]">Assign items</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tap what {activePerson.name} had — tap again to remove.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {split.people.map((person) => {
            const active = person.id === TOUR_ACTIVE_PERSON_ID;
            return (
              <span
                key={person.id}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border py-1.5 pr-3 pl-1.5",
                  active ? "border-primary bg-primary/10" : "border-border bg-card",
                )}
              >
                <PersonAvatar person={person} size="xs" />
                <span className={cn("text-sm font-semibold", active && "text-primary")}>{person.name}</span>
              </span>
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
                const quickAssigned = assignedIds.includes(TOUR_ACTIVE_PERSON_ID);
                return (
                  <TableRow key={unit.unitId} className={cn(quickAssigned && "bg-primary/5")}>
                    <TableCell className="whitespace-normal text-xs font-medium">{unitLabel(unit)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {formatPeso(unitPrice(unit.item))}
                    </TableCell>
                    <TableCell>
                      <div className="opacity-30">
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
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {split.discounts.length > 0 && (
          <div>
            <p className="mb-2 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">Discounts</p>
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableBody>
                  {split.discounts.map((discount) => {
                    const targets = discountTargets(discount, split);
                    const targetedPeople = split.people.filter((p) => targets.includes(p.id));
                    return (
                      <TableRow key={discount.id}>
                        <TableCell className="whitespace-normal text-xs font-medium">{discount.label}</TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          -{formatPeso(discount.amount)}
                        </TableCell>
                        <TableCell className="w-16">
                          <div className="flex -space-x-1.5 opacity-30">
                            {targetedPeople.map((p) => (
                              <PersonAvatar key={p.id} person={p} size="xs" className="ring-2 ring-background" />
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border bg-background/95 px-4 py-3">
        <span className="font-mono text-sm text-muted-foreground">
          {assignedCount}/{units.length} ASSIGNED
        </span>
        <Button disabled tabIndex={-1}>
          Next
        </Button>
      </div>
    </div>
  );
}
