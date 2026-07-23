export type ScannedItem = {
  name: string;
  quantity: number;
  totalPrice: number;
};

export type ScanReceiptResult = {
  items: ScannedItem[];
  serviceCharge: number;
  subtotal: number;
};

export const SCAN_PASSCODE_HEADER = "x-scan-passcode";
export const MAX_SCAN_IMAGE_BYTES = 8 * 1024 * 1024;

/** Type-guards a parsed JSON value into ScanReceiptResult, matching the Gemini responseSchema shape. */
export function isScanReceiptResult(value: unknown): value is ScanReceiptResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.serviceCharge !== "number" || typeof v.subtotal !== "number") return false;
  if (!Array.isArray(v.items)) return false;
  return v.items.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).name === "string" &&
      typeof (item as Record<string, unknown>).quantity === "number" &&
      typeof (item as Record<string, unknown>).totalPrice === "number",
  );
}
