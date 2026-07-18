import type { Person } from "@/lib/types";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
} as const;

export function PersonAvatar({
  person,
  size = "md",
  className,
}: {
  person: Person;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: person.color }}
      title={person.name}
    >
      {person.initials}
    </div>
  );
}
