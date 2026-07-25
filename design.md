# Design — KKB (Kanya-Kanyang Bayad)

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre
modern-minimal (Stripe / Linear / Vercel school). KKB is a mobile-first
functional tool, not a marketing site — there are no landing-page sections
(hero/pricing/features). The 21 Hallmark marketing macrostructures don't apply
here; the "macrostructure" for this project is the **app shell + flow shape**
below instead.

## Macrostructure family
One family only — this app has no separate marketing surface.

- **App pages** (Home, People, Receipt, Assign, Summary, History, History
  detail): single-column mobile shell, capped at `max-w-lg`, centered on
  desktop with a hairline side border. Each flow step is: TopBar → FlowStepper
  (flow pages only) → page heading (short, sentence-case, no eyebrow/kicker) →
  content → a **sticky bottom action bar** (blurred, hairline top border)
  holding the primary/secondary actions. The Home screen is the one page that
  gets hero treatment: wordmark + one-sentence value prop + a single full-width
  pill CTA + a "Recent" list rendered as refined rows, not cards-with-shadow.

## Theme
Custom, tuned on the app's existing brand blue (preserved from the prior
palette; declared here as a KKB-owned theme, not a catalog pick).

- `--color-paper`     oklch(1 0 0) — pure white (light)
- `--color-paper-2`   oklch(0.984 0.003 258) — card / muted surface (light)
- `--color-ink`       oklch(0.16 0.004 260)
- `--color-ink-2`     oklch(0.48 0.006 260) — muted-foreground
- `--color-rule`      oklch(0.9 0.004 260) — border (light)
- `--color-accent`    oklch(0.55 0.19 258) — electric indigo-blue
- `--color-accent-ink` oklch(0.99 0 0)
- `--color-focus`     oklch(0.55 0.19 258)

Dark mode:
- `--color-paper`     oklch(0.17 0.006 260)
- `--color-paper-2`   oklch(0.23 0.008 260)
- `--color-ink`       oklch(0.97 0.002 260)
- `--color-ink-2`     oklch(0.66 0.008 260)
- `--color-rule`      oklch(1 0 0 / 10%)
- `--color-accent`    oklch(0.7 0.17 258)
- `--color-accent-ink` oklch(0.99 0 0)

Zero-chroma-adjacent neutrals + pure white paper are explicitly allowed in
modern-minimal (gate 7 / gate 22 loosened). One accent hue only — no
secondary chromatic colors except the per-person avatar colors, which are
data-carrying (identity), not brand decoration, and are exempt.

## Typography
- Display: **Geist Sans**, weight 700 (already installed via `next/font`,
  `app/layout.tsx`). No new display face — Geist is the canonical
  modern-minimal SaaS display face; swapping it would fight the brief's own
  "already-Geist" foundation.
- Body: **Geist Sans**, weight 400/500/600. Same family as display
  (single-family discipline, per modern-minimal genre).
- Mono (numeric outlier): **Geist Mono** — money amounts, timestamps, counts,
  flow-stepper labels. Outlier role: **numbers and metadata only**, unchanged
  from the prior system.
- Wordmark: previously set in Quicksand (rounded/friendly — consumer-app
  register). **Changed to Geist Sans 700, tight tracking (`-0.03em`)** to match
  the modern-minimal voice. Quicksand is kept *only* for the generated
  favicon/apple-icon glyph (`icon.tsx` / `apple-icon.tsx`) — a separate, small
  brand mark out of this redesign's scope.
- Display tracking: `-0.02em` to `-0.03em` on headings and the wordmark.
- Scale anchor: page headings `text-2xl` (mobile) → unchanged; no large
  marketing display sizes needed since there's no hero-scale headline outside
  Home.

## Spacing
4-point scale via Tailwind's default spacing (`px-4`, `gap-4`, gap-1.5 etc.).
No new named scale introduced — the project already runs a 4pt grid through
Tailwind utilities; `tokens.css` documents the values in use for portability.

## Radius
Tuned down from the previous oversized unused scale (2.2×–2.6× multipliers)
to a restrained modern-SaaS scale:
- `--radius`     0.625rem (10px) — base
- `--radius-sm`  6px
- `--radius-md`  8px
- `--radius-lg`  10px
- `--radius-xl`  16px
- `--radius-2xl` 22px — sheet top corners, the home hero card
- `--radius-full` 999px — pill buttons, avatars, chips

## Motion
- Easings: `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-in: cubic-bezier(0.4, 0, 1, 1)`, `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`.
- Reveal pattern: **none.** Modern-minimal is composed, not animated-in. The
  prior per-letter bounce wordmark animation (`cubic-bezier(0.34, 1.56, 0.64, 1)`
  — an overshoot easing, disallowed by this genre) is replaced with a single
  restrained fade + 4px rise on first paint, no stagger bounce.
  entrance/exit micro-animations on list items (add/remove a person, open a
  sheet) stay — they're state feedback, not page "reveal," and already use
  non-bounce easings.
- Reduced-motion fallback: opacity-only, ≤150ms.

## Microinteractions stance
- Silent success over toasts, except where an async action can fail
  (image export) — that keeps its toast.
- Hover delay 800ms / focus delay 0ms on tooltips (service-charge info tip).
- Focus rings: visible instantly, no fade-in, ≥3:1 contrast — already the
  case via `ring-3 ring-ring/50` + `focus-visible:border-ring`.
- Buttons: **pill-shaped** (`rounded-full`) at every size — the canonical
  modern-minimal CTA shape — replacing the previous mixed
  `rounded-lg`/`rounded-[10px]` scale.

## CTA voice
- Primary: accent-filled pill, bold label, sentence case ("Start a new
  split", not "START A NEW SPLIT").
- Secondary: outline pill on transparent background.
- Destructive: tinted (not solid) — unchanged from prior system, already
  correct for this register.

## Per-page allowances
- All pages are app pages — no enrichment (Tier A–E) anywhere. Function
  carries every screen.
- Home is the only page allowed a one-time (non-repeating, non-bounce) type
  entrance.
- `/tour` is the one exception to "no separate marketing surface": a public,
  non-interactive storyboard for showing the app's flow outside the app
  (screenshots, sharing). It reuses real screens/components rendered from a
  hardcoded fictional Split, frozen with the `inert` attribute rather than
  faked — never a real user's data. Each step sits in a **hairline-border
  device silhouette** (rounded-2xl, `--color-rule` border, soft shadow) — no
  drawn notch/speaker/home-indicator, per the re-drawn-chrome rule. Captions
  stack tag-above-title in one column (mono "Step 0N — Title" + one line of
  copy), never a left-margin tag beside a heading.

## What pages MUST share
- TopBar shape (wordmark left, GitHub badge + theme toggle right).
- The pill CTA voice and accent placement.
- Geist Sans + Geist Mono, this palette, this radius scale.
- Sticky bottom action bar pattern on every flow/detail page.

## What pages MAY differ on
- FlowStepper presence (Home and History list have none; History detail has a
  back-link instead).
- Content shape inside the shell (table-based on Receipt/Assign, list-based
  on People/History, breakdown cards on Summary).

## Exports

### tokens.css
See `tokens.css` at the project root.

### shadcn/ui CSS variables
Already the project's native format — see `src/app/globals.css` `:root` /
`.dark` blocks, which this redesign edits directly (shadcn variable names are
kept; OKLCH values are tuned per the Theme section above).
