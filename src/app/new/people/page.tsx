"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TopBar } from "@/components/top-bar";
import { FlowStepper } from "@/components/flow-stepper";
import { AppShell } from "@/components/app-shell";
import { PersonAvatar } from "@/components/person-avatar";
import { useDraftSplit } from "@/lib/store/draft-split";

export default function PeoplePage() {
  const router = useRouter();
  const split = useDraftSplit((s) => s.split);
  const addPerson = useDraftSplit((s) => s.addPerson);
  const removePerson = useDraftSplit((s) => s.removePerson);

  const [name, setName] = useState("");

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    addPerson(trimmed);
    setName("");
  }

  const canContinue = split.people.length > 0;

  return (
    <AppShell>
      <TopBar />
      <FlowStepper current={0} />

      <main className="flex flex-1 flex-col gap-5 px-4 pb-28 sm:px-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-[-0.02em]">Who&apos;s at the table?</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add everyone splitting this bill.</p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Person's name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            className="h-12 flex-1 rounded-xl text-base"
          />
          <Button
            size="icon-lg"
            className="size-12 rounded-xl"
            aria-label="Add person"
            onClick={handleAdd}
            disabled={!name.trim()}
          >
            <Plus className="size-5" />
          </Button>
        </div>

        {split.people.length > 0 && (
          <div className="flex flex-col gap-2">
            {split.people.map((person) => (
              <div
                key={person.id}
                className="flex animate-in items-center gap-3 rounded-xl border bg-card py-2.5 pr-3 pl-2.5 zoom-in-95 fade-in-0"
              >
                <PersonAvatar person={person} size="sm" />
                <span className="flex-1 font-semibold">{person.name}</span>
                <button
                  type="button"
                  onClick={() => removePerson(person.id)}
                  aria-label={`Remove ${person.name}`}
                  className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="sticky bottom-0 flex items-center justify-end gap-4 border-t bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <Button disabled={!canContinue} onClick={() => router.push("/new/receipt")}>
          Next — build the receipt
        </Button>
      </div>
    </AppShell>
  );
}
