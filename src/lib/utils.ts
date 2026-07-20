import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Small mono-uppercase section label, e.g. "RECENT", "ITEM / QTY / PRICE". */
export const eyebrowClass =
  "font-mono text-[11px] font-semibold tracking-[0.08em] text-primary uppercase"
