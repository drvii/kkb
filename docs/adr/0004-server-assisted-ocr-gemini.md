# Add server-assisted receipt OCR via a thin Gemini proxy route

Status: supersedes ADR-0001

ADR-0001 deferred OCR because real accuracy needs either heavy client-side inference or a server-side vision-API proxy, and a proxy was judged to conflict with the "fully client-side" goal. Revisiting that trade-off: v2 relaxes "fully client-side" to "client-side + one thin, stateless serverless route" — still zero database and zero persistent server state — and adds one Next.js API route that forwards a receipt photo to **Gemini's Flash-Lite tier** (free tier) with `responseSchema` constrained to `{items: [{name, quantity, totalPrice}], serviceCharge, subtotal}`, matching the existing `Item`/`Charges` types directly. Gemini was chosen over Claude/GPT (no free tier), OCR.space/Tesseract.js (return raw/table text, requiring hand-rolled parsing heuristics per receipt layout instead of semantic extraction), and purpose-built document APIs like Textract/Azure Document Intelligence (return the right shape natively but require standing up a full cloud account for one low-volume route). Full comparison in `docs/research/ocr-provider-options.md`.

The exact model id is a moving target — Google sunsets old Flash-Lite versions for new API keys (2.5-flash-lite 404'd as "no longer available to new users" during implementation; 3.5-flash-lite was substituted). Whoever touches this route next should expect to bump `GEMINI_MODEL` in `route.ts` occasionally, not treat the current id as load-bearing.

Because the route is public but paid for out of one developer's free-tier quota, it's gated behind a shared-secret passcode (env var, checked server-side, entered once by each user and cached client-side) plus a lightweight rate-limit as defense-in-depth — not a full auth system, which would be disproportionate for an app with no accounts.

Scanned items are appended to the draft receipt's existing items (never replace), and the OCR-read subtotal is only used to flag a mismatch against the computed subtotal — it is never persisted, since subtotal remains a derived value per the existing domain model.
