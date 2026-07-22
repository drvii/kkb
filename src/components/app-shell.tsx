export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-1 flex-col sm:border-x sm:border-border">
      {children}
    </div>
  );
}
