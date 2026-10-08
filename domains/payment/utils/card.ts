/**
 * Input helpers for Arcade's own payment form. Presentation and early validation only — the
 * gateway is the authority on whether a card or UPI ID is real. Nothing here stores or sends.
 */

export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'rupay' | 'diners' | 'discover' | 'maestro' | '';

export const digitsOnly = (value: string) => value.replace(/\D+/g, '');

/** Best guess from the leading digits, used until (or instead of) the gateway's answer. */
export function detectNetwork(number: string): CardNetwork {
  const n = digitsOnly(number);
  if (!n) return '';
  if (/^3[47]/.test(n)) return 'amex';
  // Discover's narrower prefixes first: RuPay's broad "60" would otherwise swallow 6011.
  if (/^(6011|64[4-9])/.test(n)) return 'discover';
  if (/^(508[5-9]|60|65|81|82|353|356)/.test(n)) return 'rupay';
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(n)) return 'mastercard';
  if (/^(36|38|30[0-5])/.test(n)) return 'diners';
  if (/^(5018|5020|5038|6304|6759|676[1-3])/.test(n)) return 'maestro';
  return '';
}

/** Normalises the gateway's network name onto ours; unknown names fall back to the prefix guess. */
export function resolveNetwork(gatewayName: string, number: string): CardNetwork {
  const name = gatewayName.toLowerCase();
  const known: CardNetwork[] = ['visa', 'mastercard', 'amex', 'rupay', 'diners', 'discover', 'maestro'];
  const match = known.find((network) => name.includes(network === 'diners' ? 'diner' : network));
  return match ?? detectNetwork(number);
}

export const cardNumberMaxDigits = (network: CardNetwork) => (network === 'amex' ? 15 : 19);
export const cvvLength = (network: CardNetwork) => (network === 'amex' ? 4 : 3);

/** "4111111111111111" → "4111 1111 1111 1111"; Amex groups 4-6-5. */
export function formatCardNumber(value: string): string {
  const network = detectNetwork(value);
  const n = digitsOnly(value).slice(0, cardNumberMaxDigits(network));
  if (network === 'amex') {
    return [n.slice(0, 4), n.slice(4, 10), n.slice(10, 15)].filter(Boolean).join(' ');
  }
  return n.replace(/(.{4})/g, '$1 ').trim();
}

export function luhnValid(value: string): boolean {
  const n = digitsOnly(value);
  if (n.length < 12) return false;
  let sum = 0;
  for (let i = 0; i < n.length; i++) {
    let digit = Number(n[n.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** "0", "07", "0728" → "0", "07 / ", "07 / 28" — typed naturally, slash inserted for them. */
export function formatExpiry(value: string, previous = ''): string {
  let n = digitsOnly(value).slice(0, 4);
  if (n.length === 1 && Number(n) > 1) n = `0${n}`;
  const deleting = value.length < previous.length;
  if (n.length >= 3) return `${n.slice(0, 2)} / ${n.slice(2)}`;
  if (n.length === 2 && !deleting) return `${n} / `;
  return n;
}

/** Month and two-digit year, or null when incomplete or not a real month. */
export function parseExpiry(value: string): { month: string; year: string } | null {
  const n = digitsOnly(value);
  if (n.length !== 4) return null;
  const month = Number(n.slice(0, 2));
  if (month < 1 || month > 12) return null;
  return { month: n.slice(0, 2), year: n.slice(2) };
}

/** Valid through the end of its month. */
export function expiryInFuture(value: string, now = new Date()): boolean {
  const parsed = parseExpiry(value);
  if (!parsed) return false;
  const year = 2000 + Number(parsed.year);
  const month = Number(parsed.month);
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

/** Shape check for a UPI ID ("name@bank"); whether it exists is the gateway's call. */
export function vpaLooksValid(value: string): boolean {
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9.\-]{1,64}$/.test(value.trim());
}

/** "4111 1111 1111 1111" → "•••• •••• •••• 1111", for the card face. */
export function maskForDisplay(value: string, network: CardNetwork): string {
  const n = digitsOnly(value);
  const length = network === 'amex' ? 15 : 16;
  const shown = n.padEnd(length, '•');
  const masked = shown
    .split('')
    .map((ch, i) => (i < length - 4 && ch !== '•' ? '•' : ch))
    .join('');
  if (network === 'amex') return [masked.slice(0, 4), masked.slice(4, 10), masked.slice(10, 15)].join(' ');
  return masked.replace(/(.{4})/g, '$1 ').trim();
}
