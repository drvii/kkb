"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Split } from "@/lib/types";

const MAX_HISTORY = 5;

type HistoryState = {
  splits: Split[];
  upsert: (split: Split) => void;
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

      clear: () => set({ splits: [] }),
    }),
    { name: "kkb.history", skipHydration: true },
  ),
);
