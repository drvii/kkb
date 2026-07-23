const STORAGE_KEY = "kkb.scan-passcode";

export function getStoredScanPasscode(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setStoredScanPasscode(passcode: string): void {
  window.localStorage.setItem(STORAGE_KEY, passcode);
}
