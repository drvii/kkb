export type ScannedItem = {
  name: string;
  quantity: number;
  totalPrice: number;
};

export type ScannedDiscount = {
  label: string;
  amount: number;
};

export type ScanReceiptResult = {
  items: ScannedItem[];
  serviceCharge: number;
  deliveryFee: number;
  subtotal: number;
  discounts: ScannedDiscount[];
};

export const SCAN_PASSCODE_HEADER = "x-scan-passcode";
export const MAX_SCAN_IMAGE_BYTES = 8 * 1024 * 1024;

/** Type-guards a parsed JSON value into ScanReceiptResult, matching the Gemini responseSchema shape. */
export function isScanReceiptResult(value: unknown): value is ScanReceiptResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.serviceCharge !== "number" || typeof v.subtotal !== "number") return false;
  if (typeof v.deliveryFee !== "number") return false;
  if (!Array.isArray(v.items)) return false;
  if (!Array.isArray(v.discounts)) return false;
  const itemsValid = v.items.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).name === "string" &&
      typeof (item as Record<string, unknown>).quantity === "number" &&
      typeof (item as Record<string, unknown>).totalPrice === "number",
  );
  const discountsValid = v.discounts.every(
    (discount) =>
      typeof discount === "object" &&
      discount !== null &&
      typeof (discount as Record<string, unknown>).label === "string" &&
      typeof (discount as Record<string, unknown>).amount === "number",
  );
  return itemsValid && discountsValid;
}
