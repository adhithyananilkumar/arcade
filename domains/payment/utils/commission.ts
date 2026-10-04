import { formatMoney } from '@/shared/utils/money';
import type { CommissionRefundTreatment, EffectiveCommission } from '../types/payment.types';

/** 1000 → "10%", 1250 → "12.5%". */
export function formatRate(rateBps: number): string {
  return `${Number((rateBps / 100).toFixed(2))}%`;
}

/** "10% + ₹5.00 per sale", "No commission". Display only — the backend computes every figure. */
export function describeCommission(terms: Pick<EffectiveCommission, 'rateBps' | 'fixedFeeMinor' | 'fixedFeeCurrency'>): string {
  const parts: string[] = [];
  if (terms.rateBps > 0) parts.push(formatRate(terms.rateBps));
  if (terms.fixedFeeMinor > 0 && terms.fixedFeeCurrency) {
    parts.push(`${formatMoney(terms.fixedFeeMinor, terms.fixedFeeCurrency)} per sale`);
  }
  return parts.length ? parts.join(' + ') : 'No commission';
}

export const REFUND_TREATMENT_LABEL: Record<CommissionRefundTreatment, string> = {
  PROPORTIONAL: 'Returned with refunds',
  RETAINED: 'Kept on refunds',
};

export const REFUND_TREATMENT_HINT: Record<CommissionRefundTreatment, string> = {
  PROPORTIONAL: 'When a sale is refunded, Arcade gives back its share of the refunded amount.',
  RETAINED: 'Arcade keeps its full commission even if a sale is refunded; the channel absorbs the refund.',
};
