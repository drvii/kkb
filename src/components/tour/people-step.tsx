import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersonAvatar } from "@/components/person-avatar";
import { TOUR_SPLIT } from "@/lib/tour-fixture";

export function PeopleStep() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 px-4 py-4">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.02em]">Who&apos;s at the table?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add everyone splitting this bill.</p>
        </div>

        <div className="flex gap-2">
          <Input readOnly tabIndex={-1} placeholder="Person's name" className="h-11 flex-1 rounded-full px-4" />
          <Button size="icon-lg" tabIndex={-1} className="size-11" aria-hidden>
            <Plus className="size-5" />
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {TOUR_SPLIT.people.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card py-2.5 pr-3 pl-2.5"
            >
              <PersonAvatar person={person} size="sm" />
              <span className="flex-1 font-semibold">{person.name}</span>
              <span className="flex size-6 items-center justify-center rounded-full text-muted-foreground/50">
                <X className="size-3.5" />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-border bg-background/95 px-4 py-3">
        <Button tabIndex={-1}>Next — build the receipt</Button>
      </div>
    </div>
  );
}
