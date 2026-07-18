import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { GitHubBadge } from "@/components/github-badge";

export function TopBar({ showWordmark = true }: { showWordmark?: boolean }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 sm:px-6">
      {showWordmark ? (
        <Link href="/" className="text-sm font-semibold tracking-tight">
          KKB
        </Link>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        <GitHubBadge />
        <ThemeToggle />
      </div>
    </header>
  );
}
