import { roundCentavos } from "@/lib/money";
import type { Assignments, Item, Split, Unit } from "@/lib/types";

export function unitId(itemId: string, index: number): string {
  return `${itemId}:${index}`;
}

export function unitsForItem(item: Item): Unit[] {
  return Array.from({ length: Math.max(1, item.quantity) }, (_, index) => ({
    unitId: unitId(item.id, index),
    itemId: item.id,
    index,
    item,
  }));
}

export function allUnits(items: Item[]): Unit[] {
  return items.flatMap(unitsForItem);
}

export function unitPrice(item: Item): number {
  return item.totalPrice / Math.max(1, item.quantity);
}

export function isUnitAssigned(assignments: Assignments, unit: Unit): boolean {
  return (assignments[unit.unitId]?.length ?? 0) > 0;
}

export function isFullyAssigned(split: Split): boolean {
  const units = allUnits(split.items);
  return units.length > 0 && units.every((u) => isUnitAssigned(split.assignments, u));
}

/** Each person's rounded share of a single unit, keyed by personId. */
export function unitShares(unit: Unit, assignments: Assignments): Record<string, number> {
  const people = assignments[unit.unitId] ?? [];
  if (people.length === 0) return {};
  const share = roundCentavos(unitPrice(unit.item) / people.length);
  return Object.fromEntries(people.map((personId) => [personId, share]));
}

/** Each person's rounded equal share of VAT + service charge. */
export function chargeShare(split: Split): number {
  if (split.people.length === 0) return 0;
  const total = split.charges.vat + split.charges.serviceCharge;
  return roundCentavos(total / split.people.length);
}

export type PersonLineItem = {
  unit: Unit;
  label: string;
  shared: boolean;
  shareCount: number;
  amount: number;
};

export function personLineItems(split: Split, personId: string): PersonLineItem[] {
  const units = allUnits(split.items);
  const lines: PersonLineItem[] = [];
  for (const unit of units) {
    const sharedWith = split.assignments[unit.unitId] ?? [];
    if (!sharedWith.includes(personId)) continue;
    const shares = unitShares(unit, split.assignments);
    lines.push({
      unit,
      label: unit.item.quantity > 1 ? `${unit.item.name} (${unit.index + 1}/${unit.item.quantity})` : unit.item.name,
      shared: sharedWith.length > 1,
      shareCount: sharedWith.length,
      amount: shares[personId] ?? 0,
    });
  }
  return lines;
}

export function personItemsTotal(split: Split, personId: string): number {
  return personLineItems(split, personId).reduce((sum, line) => sum + line.amount, 0);
}

export function personTotal(split: Split, personId: string): number {
  return roundCentavos(personItemsTotal(split, personId) + chargeShare(split));
}

export function receiptSubtotal(items: Item[]): number {
  return roundCentavos(items.reduce((sum, item) => sum + item.totalPrice, 0));
}

export function receiptGrandTotal(split: Split): number {
  return roundCentavos(receiptSubtotal(split.items) + split.charges.vat + split.charges.serviceCharge);
}

export function splitPeopleTotal(split: Split): number {
  return roundCentavos(split.people.reduce((sum, p) => sum + personTotal(split, p.id), 0));
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1) {
    const word = parts[0];
    return word.length >= 2
      ? word[0].toUpperCase() + word[1].toLowerCase()
      : word.toUpperCase();
  }
  return "?";
}

const COLOR_PALETTE = [
  "oklch(0.65 0.2 25)",
  "oklch(0.65 0.18 145)",
  "oklch(0.62 0.21 260)",
  "oklch(0.75 0.18 80)",
  "oklch(0.65 0.22 320)",
  "oklch(0.7 0.15 200)",
  "oklch(0.65 0.2 40)",
  "oklch(0.6 0.15 300)",
  "oklch(0.7 0.19 170)",
  "oklch(0.65 0.23 10)",
];

export function colorForIndex(index: number): string {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}
