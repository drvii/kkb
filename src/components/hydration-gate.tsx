"use client";

import { useEffect, useState } from "react";
import { useDraftSplit } from "@/lib/store/draft-split";
import { useHistoryStore } from "@/lib/store/history";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([useDraftSplit.persist.rehydrate(), useHistoryStore.persist.rehydrate()]).finally(
      () => setReady(true),
    );
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
