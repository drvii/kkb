import { NextRequest, NextResponse } from "next/server";
import { isScanReceiptResult, MAX_SCAN_IMAGE_BYTES, SCAN_PASSCODE_HEADER } from "@/lib/ocr";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const EXTRACTION_PROMPT = `You are reading a photo of a Philippine restaurant receipt. Extract:
- items: every line item, with its printed name, quantity (default 1 if not printed), and total price for that line (not unit price)
- serviceCharge: the flat service charge amount if printed, otherwise 0
- subtotal: the printed subtotal amount if present, otherwise 0
- discounts: every printed discount or deduction line (e.g. "PWD Disc", "Senior Citizen Disc", "Less: Discount"), with its printed label and its amount as a positive number (do not include a minus sign). Empty array if none are printed.

All amounts are in Philippine pesos — return plain numbers with no currency symbol or thousands separators.
If the image is not a receipt, or the text is unreadable, return items and discounts as empty arrays and 0 for serviceCharge and subtotal.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          quantity: { type: "INTEGER" },
          totalPrice: { type: "NUMBER" },
        },
        required: ["name", "quantity", "totalPrice"],
      },
    },
    serviceCharge: { type: "NUMBER" },
    subtotal: { type: "NUMBER" },
    discounts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          label: { type: "STRING" },
          amount: { type: "NUMBER" },
        },
        required: ["label", "amount"],
      },
    },
  },
  required: ["items", "serviceCharge", "subtotal", "discounts"],
};

// Best-effort, in-memory only — resets on cold start. Defense-in-depth behind
// the passcode gate below, not the primary abuse control (see ADR-0004).
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 8;
let requestTimestamps: number[] = [];

function isRateLimited(): boolean {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) return true;
  requestTimestamps.push(now);
  return false;
}

export async function POST(request: NextRequest) {
  const expectedPasscode = process.env.SCAN_PASSCODE;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!expectedPasscode || !apiKey) {
    return NextResponse.json({ error: "Scan receipt is not configured." }, { status: 500 });
  }

  const passcode = request.headers.get(SCAN_PASSCODE_HEADER);
  if (passcode !== expectedPasscode) {
    return NextResponse.json({ error: "Invalid passcode." }, { status: 401 });
  }

  if (isRateLimited()) {
    return NextResponse.json({ error: "Too many scans, try again in a minute." }, { status: 429 });
  }

  const formData = await request.formData();
  const image = formData.get("image");
  if (!(image instanceof File)) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }
  if (!image.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image." }, { status: 400 });
  }
  if (image.size > MAX_SCAN_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image is too large." }, { status: 413 });
  }

  const bytes = await image.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const geminiResponse = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: EXTRACTION_PROMPT },
            { inline_data: { mime_type: image.type || "image/jpeg", data: base64 } },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        response_schema: RESPONSE_SCHEMA,
      },
    }),
  });

  if (!geminiResponse.ok) {
    return NextResponse.json({ error: "Scan failed, try again." }, { status: 502 });
  }

  const payload = await geminiResponse.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    return NextResponse.json({ error: "Scan failed, try again." }, { status: 502 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Scan failed, try again." }, { status: 502 });
  }

  if (!isScanReceiptResult(parsed) || parsed.items.length === 0) {
    return NextResponse.json({ error: "Couldn't read that as a receipt." }, { status: 422 });
  }

  return NextResponse.json(parsed);
}
