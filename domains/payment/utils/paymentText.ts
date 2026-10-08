import { formatMoney } from '@/shared/utils/money';

/**
 * Makes gateway and audit text readable for operators and learners.
 *
 * The backend now writes plain sentences, but rows recorded earlier hold raw strings —
 * "200 INR minor units, open until 2026-10-07T08:54:27.66Z" and "400 Bad Request: {json}" — and
 * those stay in the database forever, so the client tidies both forms.
 */

const MINOR_UNITS = /\b(\d+) ([A-Z]{3}) minor units\b/g;
const ISO_INSTANT = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})\b/g;

function localTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

/** Pulls Razorpay's own sentence out of an error that embeds its JSON body; null when there is none. */
export function gatewayDescription(text: string): string | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    const description = parsed?.error?.description ?? parsed?.description;
    if (typeof description === 'string' && description.trim()) return description.trim();
  } catch {
    // Truncated or not quite JSON — fall through to a plain match.
  }
  return text.match(/"description"\s*:\s*"([^"]+)"/)?.[1] ?? null;
}

/** An audit or error line, made readable: money formatted, timestamps local, gateway JSON reduced to its sentence. */
export function humanizePaymentText(text: string | null | undefined): string {
  if (!text) return '';
  const description = gatewayDescription(text);
  if (description) {
    const lead = /refund/i.test(text) ? 'Razorpay declined the refund' : 'Razorpay declined the request';
    return `${lead}: ${description}`;
  }
  return text
    .replace(MINOR_UNITS, (_, minor: string, currency: string) => formatMoney(Number(minor), currency))
    .replace(ISO_INSTANT, (iso) => localTime(iso))
    .replace(/ returned$/, ' sent to the learner’s bank');
}

/** What an operator can do about a failed gateway call, when the cause is recognisable. */
export function gatewayFailureHint(text: string | null | undefined): string | null {
  if (!text) return null;
  const t = text.toLowerCase();
  if (t.includes('not have enough balance')) {
    return 'Your Razorpay balance is lower than the refund. Add funds in Razorpay Dashboard → Balances, or wait for new payments to settle, then refund again. Nothing was sent to the learner.';
  }
  if (t.includes('fully refunded') || t.includes('already been refunded')) {
    return 'Razorpay shows this payment as already refunded. Check the dashboard before trying again.';
  }
  if (t.includes('authentication failed') || t.includes('api key')) {
    return 'Razorpay rejected Arcade’s API keys. Check RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET on the server.';
  }
  return null;
}
