"use client";

import { useRouter } from "next/navigation";
import { Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TopBar } from "@/components/top-bar";
import { PersonAvatar } from "@/components/person-avatar";
import { useHistoryStore } from "@/lib/store/history";
import { formatPeso } from "@/lib/money";
import { receiptGrandTotal } from "@/lib/split-math";

export default function HistoryPage() {
  const router = useRouter();
  const splits = useHistoryStore((s) => s.splits);
  const clear = useHistoryStore((s) => s.clear);

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <TopBar />

      <main className="flex flex-1 flex-col gap-6 px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-xl font-semibold">Recent splits</h1>
          <p className="text-sm text-muted-foreground">
            Your last {splits.length} {splits.length === 1 ? "split" : "splits"}, saved on this device.
          </p>
        </div>

        {splits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No splits yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {splits.map((split) => (
              <li key={split.id}>
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/history/${split.id}`)}
                  className="cursor-pointer"
                >
                  <CardContent className="flex items-center gap-3 py-3">
                    <div className="flex flex-1 flex-col gap-1.5">
                      <span className="text-sm text-muted-foreground">
                        {new Date(split.createdAt).toLocaleString("en-PH", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      <div className="flex -space-x-2">
                        {split.people.map((p) => (
                          <PersonAvatar key={p.id} person={p} size="sm" className="ring-2 ring-background" />
                        ))}
                      </div>
                    </div>
                    <span className="font-semibold">{formatPeso(receiptGrandTotal(split))}</span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}

        {splits.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="ghost" className="self-start text-muted-foreground">
                  <Trash2 className="size-4" />
                  Clear history
                </Button>
              }
            />

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear recent splits?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes all saved splits from this device. This can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => clear()}>Clear</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </main>
    </div>
  );
}
