export function StepFrame({
  step,
  title,
  caption,
  children,
}: {
  step: number;
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex flex-col gap-1 px-1">
        <span className="font-mono text-xs font-semibold tracking-[0.08em] text-primary uppercase">
          Step 0{step}
        </span>
        <p className="text-lg font-bold tracking-[-0.02em]">{title}</p>
        <p className="text-sm text-muted-foreground">{caption}</p>
      </figcaption>
      <div
        inert
        aria-hidden
        style={{ zoom: 0.62, width: 358 }}
        className="select-none self-start overflow-hidden rounded-2xl border border-border bg-background shadow-[0_16px_40px_-24px_oklch(20%_0.02_260_/_0.35)]"
      >
        {children}
      </div>
    </figure>
  );
}
