"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Item, Person, Split } from "@/lib/types";
import { colorForIndex, getInitials, unitsForItem } from "@/lib/split-math";

function emptySplit(): Split {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    items: [],
    people: [],
    assignments: {},
    charges: { vat: 0, serviceCharge: 0 },
  };
}

type DraftSplitState = {
  split: Split;
  startNew: () => void;
  addItem: (item: Omit<Item, "id">) => void;
  updateItem: (id: string, patch: Partial<Omit<Item, "id">>) => void;
  removeItem: (id: string) => void;
  setCharges: (charges: Partial<Split["charges"]>) => void;
  addPerson: (name: string) => void;
  removePerson: (id: string) => void;
  toggleUnitPerson: (unitId: string, personId: string) => void;
};

export const useDraftSplit = create<DraftSplitState>()(
  persist(
    (set) => ({
      split: emptySplit(),

      startNew: () => set({ split: emptySplit() }),

      addItem: (item) =>
        set((state) => ({
          split: {
            ...state.split,
            items: [...state.split.items, { ...item, id: crypto.randomUUID() }],
          },
        })),

      updateItem: (id, patch) =>
        set((state) => {
          const items = state.split.items.map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          );
          const updated = items.find((item) => item.id === id);
          const assignments = { ...state.split.assignments };
          if (updated) {
            const validUnitIds = new Set(unitsForItem(updated).map((u) => u.unitId));
            for (const key of Object.keys(assignments)) {
              if (key.startsWith(`${id}:`) && !validUnitIds.has(key)) {
                delete assignments[key];
              }
            }
          }
          return { split: { ...state.split, items, assignments } };
        }),

      removeItem: (id) =>
        set((state) => {
          const assignments = { ...state.split.assignments };
          for (const key of Object.keys(assignments)) {
            if (key.startsWith(`${id}:`)) delete assignments[key];
          }
          return {
            split: {
              ...state.split,
              items: state.split.items.filter((item) => item.id !== id),
              assignments,
            },
          };
        }),

      setCharges: (charges) =>
        set((state) => ({
          split: { ...state.split, charges: { ...state.split.charges, ...charges } },
        })),

      addPerson: (name) =>
        set((state) => {
          const person: Person = {
            id: crypto.randomUUID(),
            name,
            initials: getInitials(name),
            color: colorForIndex(state.split.people.length),
          };
          return { split: { ...state.split, people: [...state.split.people, person] } };
        }),

      removePerson: (id) =>
        set((state) => {
          const assignments: Split["assignments"] = {};
          for (const [unitId, personIds] of Object.entries(state.split.assignments)) {
            assignments[unitId] = personIds.filter((personId) => personId !== id);
          }
          return {
            split: {
              ...state.split,
              people: state.split.people.filter((p) => p.id !== id),
              assignments,
            },
          };
        }),

      toggleUnitPerson: (unitId, personId) =>
        set((state) => {
          const current = state.split.assignments[unitId] ?? [];
          const next = current.includes(personId)
            ? current.filter((id) => id !== personId)
            : [...current, personId];
          return {
            split: {
              ...state.split,
              assignments: { ...state.split.assignments, [unitId]: next },
            },
          };
        }),

    }),
    { name: "kkb.draft-split", skipHydration: true },
  ),
);
