"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { TopBar } from "@/components/top-bar";
import { FlowStepper } from "@/components/flow-stepper";
import { PersonAvatar } from "@/components/person-avatar";
import { useDraftSplit } from "@/lib/store/draft-split";

export default function PeoplePage() {
  const router = useRouter();
  const split = useDraftSplit((s) => s.split);
  const addPerson = useDraftSplit((s) => s.addPerson);
  const removePerson = useDraftSplit((s) => s.removePerson);

  const [name, setName] = useState("");

  useEffect(() => {
    if (split.items.length === 0) router.replace("/new/receipt");
  }, [split.items.length, router]);

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    addPerson(trimmed);
    setName("");
  }

  const canContinue = split.people.length > 0;

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <TopBar />
      <FlowStepper current={1} />

      <main className="flex flex-1 flex-col gap-6 px-4 pb-28 sm:px-6">
        <div>
          <h1 className="text-xl font-semibold">Who&apos;s at the table?</h1>
          <p className="text-sm text-muted-foreground">Add everyone who&apos;ll be splitting this bill.</p>
        </div>

        {split.people.length > 0 && (
          <ul className="flex flex-col gap-2">
            {split.people.map((person) => (
              <Card key={person.id}>
                <CardContent className="flex items-center gap-3 py-3">
                  <PersonAvatar person={person} />
                  <span className="flex-1 font-medium">{person.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${person.name}`}
                    onClick={() => removePerson(person.id)}
                  >
                    <X className="size-4 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </ul>
        )}

        <Card>
          <CardContent className="flex gap-2 py-4">
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
              className="flex-1"
            />
            <Button onClick={handleAdd} disabled={!name.trim()}>
              <Plus className="size-4" />
              Add
            </Button>
          </CardContent>
        </Card>
      </main>

      <div className="sticky bottom-0 flex items-center justify-end gap-4 border-t bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <Button disabled={!canContinue} onClick={() => router.push("/new/assign")}>
          Next
        </Button>
      </div>
    </div>
  );
}
