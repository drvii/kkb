# OCR provider options for receipt line-item extraction

Research date: 2026-07-24. Scope: pick a hosted vision API for KKB's one planned server-side route — photograph a restaurant receipt in, get back `{ items: [{name, quantity, totalPrice}], serviceCharge, subtotal }`. Volume: a handful of users, dozens to low hundreds of scans/month.

## Summary

At this volume, cost is basically a rounding error everywhere except the purpose-built document-AI APIs, which charge per page regardless of whether you use it once or 100,000 times and require standing up a cloud account (AWS/GCP/Azure IAM, SDKs, service pricing tiers) to do it. The general vision LLMs — Claude, GPT, Gemini — all support image input plus native JSON-schema-constrained output as a first-class Messages/Chat-Completions feature, so "get structured JSON out of a receipt photo" is a single API call with no custom parsing logic, for a fraction of a cent per receipt. Gemini is the only one of the three with an actual no-credit-card free tier. The purpose-built OCR APIs (Textract, Azure Document Intelligence) return line items natively and typically more reliably for this specific document type, but the account-setup overhead is disproportionate for a solo hobby dev doing occasional scans, and Google's Document AI Expense Parser specifically does *not* return quantity/unit price for line items out of the box — a real gap against KKB's schema.

## Comparison table

| Provider / model | Cost per receipt scan (low volume) | Free tier? | Native structured JSON output? | Setup friction |
|---|---|---|---|---|
| **Anthropic Claude Haiku 4.5** | ~$0.002–0.004 (image ≈1,300 tokens at $1/MTok input + short JSON output at $5/MTok) | No documented always-on free tier | Yes — `output_config.format` (json_schema) and tool use with `strict: true` are first-class Messages API features; images are just another content block, no documented restriction combining them | API key + billing (credit card) via Anthropic Console; no cloud account needed |
| **Anthropic Claude Sonnet 5** | ~$0.01–0.02 (pricier tokens; also higher-res vision tier so more tokens/image) | No | Same as Haiku | Same as Haiku |
| **OpenAI gpt-5.4-nano** (cheapest current vision model, successor line to gpt-4o-mini) | ~$0.001–0.003 ($0.20/MTok input, $1.25/MTok output; images priced via 32×32px patches with a model-specific multiplier) | Not found on pricing page | Yes — `response_format`/structured outputs (json_schema) is a general Chat Completions/Responses feature; docs don't explicitly confirm the vision+schema combination but document no restriction either | API key + billing (credit card) via OpenAI platform |
| **OpenAI gpt-5.4-mini** | ~$0.005–0.01 | Not found | Same | Same |
| **Google Gemini 2.5 Flash** | $0 within free tier; paid: ~$0.001–0.003 ($0.30/MTok input incl. images, $2.50/MTok output) | **Yes** — free tier via Google AI Studio, no credit card required to start; exact RPM/RPD limits are shown live in the AI Studio dashboard rather than the pricing page | Yes — `responseSchema`/`responseMimeType: application/json` is documented as a general feature; vision+schema combination not explicitly called out but no restriction documented | Just an AI Studio API key — lowest friction of the three LLMs |
| **Google Gemini 2.5 Flash-Lite** | $0 within free tier; paid: ~$0.0004–0.001 ($0.10/MTok input, $0.40/MTok output) | Yes, same as above | Yes | Same |
| **AWS Textract — AnalyzeExpense** | $0.01/page (first 1M pages/mo), $0.008/page after | 100 pages/month free for **3 months** for new AWS customers only | N/A (not an LLM) — but **natively returns line items** (`ITEM`, `QUANTITY`, `PRICE` per row) plus `SummaryFields` (total, subtotal, tax, tip) — closest out-of-the-box match to KKB's schema | AWS account, IAM credentials/roles, SDK — meaningfully heavier than an API key |
| **Google Document AI — Expense Parser** | $0.01/page ($0.10 per 10 pages) | No processor-specific free tier (only the general $300 GCP trial credit) | N/A — returns `line_item/description` and `line_item/amount` natively, but **not** `quantity` or `unit_price` (unlike the separate Invoice Parser) — would need custom logic to backfill quantity | GCP account, service account/IAM, Document AI processor provisioning |
| **Azure AI Document Intelligence — prebuilt-receipt** | ~$0.01/page ($10/1,000 pages, S0 tier) | **Yes** — F0 tier: 500 pages/month free, but limited to the first 2 pages of any document and 4MB file size | N/A — natively returns an `Items` array with `Name`, `Quantity`, `Price`, `TotalPrice` per line — **exact match** to KKB's target shape | Azure account, resource provisioning, SDK/REST — heavier than an API key |
| **Mindee (Receipt OCR)** | ~$0.044/page (credit-based) | 14-day free trial, no specific free page quota stated; paid plans have a **$44–116/month minimum** | Yes, returns structured receipt fields incl. line items | Low-friction API key, but the monthly plan minimum is a bad fit for "dozens of scans/month" |
| **Veryfi** | $0.08/receipt on paid tier (requires a **$500/mo minimum commitment** past the free tier) | **Yes — 100 documents/month free**, no mention of a required card for the free tier | Yes, returns structured receipt fields incl. line items | Low-friction API key; free tier alone likely covers KKB's entire monthly volume, but the paid tier is priced for real businesses, not hobby overflow |

## Primary pick: Google Gemini 2.5 Flash (or Flash-Lite), free tier

For a hobby app with a handful of users and occasional use, this is the best fit on every axis that matters here:

- **$0 cost** at KKB's volume — the free tier is real, documented, and doesn't require a credit card to activate, unlike every other option in this table except Veryfi's free 100-doc allotment.
- **Lowest setup friction of the LLM options** — one API key from AI Studio, no cloud IAM, no service account, no billing profile to configure just to try it.
- **Native structured output** (`responseSchema`) maps directly onto KKB's `Item`/`Charges` TypeScript shape — one request, no custom parsing.
- Even if KKB ever outgrows the free tier, Flash-Lite's paid pricing ($0.10/$0.40 per MTok) keeps monthly cost at fractions of a cent per receipt.

The one caveat worth a line in the code comment: Google's pricing page notes free-tier content may be used to improve their products — worth knowing if receipts ever contain anything more sensitive than a food order, though for a bill-splitting app this is a low-stakes tradeoff.

## Fallback pick: Anthropic Claude Haiku 4.5

If the free-tier data-usage terms are a blocker, or the free tier's rate limits prove too tight or flaky for a "just works" hobby deploy, Haiku 4.5 is the next-simplest option:

- No free tier, so it requires adding a credit card to an Anthropic Console account — the one piece of friction it adds over Gemini.
- But at hobby volume (dozens to low hundreds of scans/month) the actual bill is negligible — roughly $0.002–0.004 per receipt, i.e. well under $1/month even at 200 scans.
- Structured JSON output (`output_config.format` or tool use with `strict: true`) is natively supported and combines with image input in the same request with no documented restriction.
- Anthropic's own docs are explicit about accuracy caveats worth designing around regardless of provider: Claude "might hallucinate or make mistakes when interpreting low-quality, rotated, or very small images," and item counts on images are "approximate" — sensible defaults are to let the user review/edit extracted line items before saving, not trust the OCR blindly.

## Why not the purpose-built OCR APIs, given they return line items natively

They're the right tool at real volume, but wrong for this app today. AWS Textract's AnalyzeExpense and Azure's prebuilt-receipt both return exactly KKB's target shape (name/quantity/price line items, subtotal, tax/tip) without any prompting or JSON-schema work — genuinely the least custom-logic option. But getting there means an AWS or Azure account, IAM/resource setup, and SDK integration for a single API route in an otherwise fully client-side hobby app — a lot of standing infrastructure for occasional low-volume use. Google's Document AI Expense Parser has the added wrinkle that it doesn't extract quantity or unit price at all (only description + amount), which would still require custom logic to backfill against KKB's schema — undermining the "it's purpose-built, so no custom logic" premise for this specific processor.

## Accuracy benchmarks: what the primary docs actually say

Anthropic, OpenAI, and Google's own documentation do **not** publish quantified accuracy benchmarks specifically for receipt or document-OCR-style image understanding versus general vision tasks. What Anthropic's vision docs do state, as qualitative guidance rather than a benchmark number, is that Claude "might hallucinate or make mistakes when interpreting low-quality, rotated, or very small images under 200 pixels," that "coordinate and localization outputs are approximate," and that counting "might not always be precisely accurate, especially with large numbers of small objects" — all directly relevant to photographed receipts (which are frequently low-quality, off-axis phone photos with many small line items). No equivalent explicit accuracy statement was found in OpenAI's or Google's official docs during this research. Third-party benchmarks and blog comparisons of Claude/GPT/Gemini on OCR and document tasks exist (e.g. academic arXiv papers, vendor blogs), but per this research's primary-sources-only constraint they're excluded here rather than cited as authoritative — treat any specific accuracy percentage you see quoted elsewhere as unverified against the vendors' own docs.

## Sources

- [Anthropic — Vision](https://platform.claude.com/docs/en/build-with-claude/vision) — image token cost, resolution tiers, request limits, accuracy limitations
- [Anthropic — Models overview](https://platform.claude.com/docs/en/about-claude/models/overview) — Haiku 4.5 / Sonnet 5 pricing, vision support across all current models
- [Anthropic — Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) — model support for `output_config.format`
- [Anthropic — Tool use overview](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) — tool-use mechanics and pricing
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing) — gpt-5.4-nano/mini/full pricing (redirected from platform.openai.com/docs/pricing)
- [OpenAI — Images and vision](https://developers.openai.com/api/docs/guides/images-vision) — vision-capable models, image token/patch cost calculation
- [OpenAI — Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) — json_schema response format support
- [Google — Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) — Flash / Flash-Lite / Flash Preview pricing and free tier
- [Google — Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) — free-tier limits (live values in AI Studio dashboard)
- [Google — Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output) — `responseSchema` support
- [AWS — Amazon Textract pricing](https://aws.amazon.com/textract/pricing/) — AnalyzeExpense per-page pricing and free tier
- [AWS — Invoice and receipt response objects (AnalyzeExpense)](https://docs.aws.amazon.com/textract/latest/dg/expensedocuments.html) — native `ITEM`/`QUANTITY`/`PRICE` line-item extraction
- [Google Cloud — Document AI pricing](https://cloud.google.com/document-ai/pricing) — Expense Parser per-page pricing
- [Google Cloud — Document AI processors list](https://docs.cloud.google.com/document-ai/docs/processors-list) — Expense Parser field list (no native quantity/unit_price)
- [Microsoft Learn — Receipt data extraction (Document Intelligence)](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/prebuilt/receipt) — native `Items` array schema (Name/Quantity/Price/TotalPrice)
- [Azure AI Document Intelligence pricing](https://azure.microsoft.com/en-us/pricing/details/ai-document-intelligence/) — prebuilt-receipt S0 pricing and F0 free tier (page timed out live during this research; figures cross-corroborated via [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5592258/how-is-azure-document-intelligence-priced) and independent third-party pricing summaries, not solely a single primary fetch — verify directly before relying on the exact number)
- [Mindee pricing](https://www.mindee.com/pricing) — credit-based receipt OCR pricing
- [Veryfi pricing](https://www.veryfi.com/pricing/) — free tier and per-document pricing
