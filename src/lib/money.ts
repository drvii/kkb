export function roundCentavos(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function formatPeso(amount: number): string {
  return `₱${roundCentavos(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
