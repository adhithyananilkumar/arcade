import type { PaymentOrderStatus } from '../types/payment.types';

const STYLES: Record<string, { label: string; badge: string; dot: string }> = {
  CREATED: { label: 'Opening', badge: 'bg-slate-100 text-slate-700 border-slate-200/80', dot: 'bg-slate-400' },
  PENDING: { label: 'Checkout open', badge: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500 animate-pulse' },
  PAID: { label: 'Paid', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  PARTIALLY_REFUNDED: { label: 'Part refunded', badge: 'bg-sky-50 text-sky-700 border-sky-200/80', dot: 'bg-sky-500' },
  REFUNDED: { label: 'Refunded', badge: 'bg-violet-50 text-violet-700 border-violet-200/80', dot: 'bg-violet-500' },
  FAILED: { label: 'Failed', badge: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500' },
  EXPIRED: { label: 'Expired', badge: 'bg-slate-100 text-slate-600 border-slate-200/80', dot: 'bg-slate-400' },
  CANCELLED: { label: 'Cancelled', badge: 'bg-slate-100 text-slate-500 border-slate-200/80', dot: 'bg-slate-400' },
};

export function PaymentStatusBadge({ status }: { status: PaymentOrderStatus | string }) {
  const style = STYLES[status] ?? { label: status, badge: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold ${style.badge}`}>
      <span className={`size-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
