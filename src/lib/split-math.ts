import { roundCentavos } from "@/lib/money";
import type { Assignments, Item, Split, Unit } from "@/lib/types";

export function unitId(itemId: string, index: number): string {
  return `${itemId}:${index}`;
}

/** Inverse of unitId — the Item a unit belongs to. */
export function itemIdFromUnitId(id: string): string {
  return id.slice(0, id.lastIndexOf(":"));
}

export function unitLabel(unit: Unit): string {
  return unit.item.quantity > 1 ? `${unit.item.name} (${unit.index + 1}/${unit.item.quantity})` : unit.item.name;
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

/** A unit's price when split shareCount ways — the single source of truth for shared-price rounding. */
export function unitShareAmount(item: Item, shareCount: number): number {
  return roundCentavos(unitPrice(item) / Math.max(1, shareCount));
}

/** Each person's rounded share of a single unit, keyed by personId. */
export function unitShares(unit: Unit, assignments: Assignments): Record<string, number> {
  const people = assignments[unit.unitId] ?? [];
  if (people.length === 0) return {};
  const share = unitShareAmount(unit.item, people.length);
  return Object.fromEntries(people.map((personId) => [personId, share]));
}

/** Each person's rounded equal share of the service charge. */
export function chargeShare(split: Split): number {
  if (split.people.length === 0) return 0;
  return roundCentavos(split.charges.serviceCharge / split.people.length);
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
      label: unitLabel(unit),
      shared: sharedWith.length > 1,
      shareCount: sharedWith.length,
      amount: shares[personId] ?? 0,
    });
  }
  return lines;
}

export type PersonBreakdown = {
  lineItems: PersonLineItem[];
  chargeShare: number;
  total: number;
};

/** Everything needed to render one Person's card: their line items, service-charge share, and total. */
export function personBreakdown(split: Split, personId: string): PersonBreakdown {
  const lineItems = personLineItems(split, personId);
  const charge = chargeShare(split);
  const itemsTotal = lineItems.reduce((sum, line) => sum + line.amount, 0);
  return { lineItems, chargeShare: charge, total: roundCentavos(itemsTotal + charge) };
}

export function receiptSubtotal(items: Item[]): number {
  return roundCentavos(items.reduce((sum, item) => sum + item.totalPrice, 0));
}

export function receiptGrandTotal(split: Split): number {
  return roundCentavos(receiptSubtotal(split.items) + split.charges.serviceCharge);
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
  "#12b886",
  "#fd7e14",
  "#4dabf7",
  "#f06595",
  "#9775fa",
  "#fab005",
];

export function colorForIndex(index: number): string {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}
