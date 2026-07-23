"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Split } from "@/lib/types";

const MAX_HISTORY = 5;

type HistoryState = {
  splits: Split[];
  upsert: (split: Split) => void;
  renameSplit: (id: string, name: string) => void;
  togglePaid: (splitId: string, personId: string) => void;
  clear: () => void;
};

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      splits: [],

      upsert: (split) =>
        set((state) => {
          const withoutExisting = state.splits.filter((s) => s.id !== split.id);
          return { splits: [split, ...withoutExisting].slice(0, MAX_HISTORY) };
        }),

      renameSplit: (id, name) =>
        set((state) => ({
          splits: state.splits.map((s) => (s.id === id ? { ...s, name } : s)),
        })),

      togglePaid: (splitId, personId) =>
        set((state) => ({
          splits: state.splits.map((s) =>
            s.id === splitId
              ? {
                  ...s,
                  people: s.people.map((p) =>
                    p.id === personId ? { ...p, paid: !p.paid } : p,
                  ),
                }
              : s,
          ),
        })),

      clear: () => set({ splits: [] }),
    }),
    { name: "kkb.history", skipHydration: true },
  ),
);
