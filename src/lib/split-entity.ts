import type { Split } from "@/lib/types";

/** Pure transforms on a single Split, shared by the draft and history stores. */

export function togglePersonPaid(split: Split, personId: string): Split {
  return {
    ...split,
    people: split.people.map((p) => (p.id === personId ? { ...p, paid: !p.paid } : p)),
  };
}

export function renameSplit(split: Split, name: string): Split {
  return { ...split, name };
}
