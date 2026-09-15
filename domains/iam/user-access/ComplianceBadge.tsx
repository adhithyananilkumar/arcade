import { CheckCircle2, AlertTriangle, ShieldAlert, UserX, ClipboardList } from 'lucide-react';
import type { ComplianceStatus } from '@/domains/identity';

const CONFIG: Record<
  ComplianceStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  COMPLIANT: {
    label: 'Compliant',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  UNASSIGNED_USER: {
    label: 'No Access',
    className: 'bg-slate-100 text-slate-500 border-slate-200',
    icon: UserX,
  },
  ADMIN_WITHOUT_POLICY: {
    label: 'Admin, No Policy',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: ShieldAlert,
  },
  TASK_MISSING_REQUIRED_POLICY: {
    label: 'Missing Policy',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertTriangle,
  },
  ADMIN_WITHOUT_TASKS: {
    label: 'No Tasks',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: ClipboardList,
  },
};

export function ComplianceBadge({ status, className = '' }: { status: ComplianceStatus; className?: string }) {
  const cfg = CONFIG[status] ?? CONFIG.UNASSIGNED_USER;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cfg.className} ${className}`}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}
