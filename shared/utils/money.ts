// Money is transported everywhere as integer minor units (e.g. cents/paise) + an
// ISO-4217 currency code, matching the backend's money model. These are pure
// presentational helpers — the backend remains the source of truth for amounts.

/** Converts a decimal amount (e.g. user input "9.99") to integer minor units (999). */
export function toMinorUnits(decimalAmount: number): number {
  return Math.round(decimalAmount * 100);
}

/** Converts integer minor units (999) back to a decimal amount (9.99), e.g. for editing in a form. */
export function fromMinorUnits(minorUnits: number): number {
  return minorUnits / 100;
}

/** Formats integer minor units as a localized currency string, e.g. formatMoney(99900, "INR") -> "₹999.00". */
export function formatMoney(minorUnits: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(fromMinorUnits(minorUnits ?? 0));
}
