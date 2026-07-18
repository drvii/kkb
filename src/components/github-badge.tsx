"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO;

export function GitHubBadge() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    if (!REPO) return;
    let cancelled = false;
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!REPO) return null;

  return (
    <a
      href={`https://github.com/${REPO}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Star className="size-3.5" />
      {stars !== null && <span>{stars}</span>}
    </a>
  );
}
