"use client";

import { useCallback, useState } from "react";
import { notFound, usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Building2, LayoutDashboard, Percent, Receipt } from "lucide-react";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { AuthorizationService } from "@/infrastructure/auth/authorization.service";
import { PERIODS, PaymentsOverviewTab, type Period } from "./components/PaymentsOverviewTab";
import { PaymentLedgerTab } from "./components/PaymentLedgerTab";
import { ChannelBalancesTab } from "./components/ChannelBalancesTab";
import { ReconciliationTab } from "./components/ReconciliationTab";
import { OrderDrawer } from "./components/OrderDrawer";
import { CommissionTab } from "./components/CommissionTab";

type Tab = "overview" | "transactions" | "channels" | "commission" | "issues";

const TABS: { id: Tab; label: string; icon: typeof Receipt }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "channels", label: "Channel balances", icon: Building2 },
  { id: "commission", label: "Commission", icon: Percent },
  { id: "issues", label: "Reconciliation", icon: AlertTriangle },
];

/**
 * Arc Console → Payments. Tab, period, selected channel and open order live in the URL so a view
 * can be shared or reloaded. Every action is re-authorized by the backend.
 */
export default function PaymentsConsolePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);

  const tab = (TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "overview") as Tab;
  const period = (PERIODS.some((p) => p.id === params.get("period")) ? params.get("period") : "30d") as Period;
  const channelId = params.get("channel");
  const orderId = params.get("order");

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(changes).forEach(([key, value]) => (value === null ? next.delete(key) : next.set(key, value)));
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  if (!AuthorizationService.canViewPayments(user)) {
    notFound();
  }
  const canRefund = AuthorizationService.canRefundPayments(user);
  const canManageCommission = AuthorizationService.canManageCommission(user);
  const openOrder = (id: string) => update({ order: id });

  return (
    <div className="flex h-full w-full flex-col space-y-5 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-[0_2px_8px_rgba(20,20,43,0.04)] backdrop-blur-md">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => update({ tab: id, channel: null })}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                tab === id ? "bg-[#14142b] text-white shadow-xs" : "text-slate-500 hover:bg-slate-50 hover:text-[#14142b]"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {(tab === "overview" || tab === "channels") && (
          <div className="flex gap-1 rounded-full border border-slate-200/80 bg-white p-1">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => update({ period: p.id })}
                className={`cursor-pointer rounded-full px-3 py-1 text-[11.5px] font-semibold ${
                  period === p.id ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === "overview" && (
        <PaymentsOverviewTab
          period={period}
          onOpenChannel={(id) => update({ tab: "channels", channel: id })}
          onOpenIssues={() => update({ tab: "issues" })}
        />
      )}
      {tab === "transactions" && <PaymentLedgerTab onOpenOrder={openOrder} refreshKey={refreshKey} />}
      {tab === "channels" && (
        <ChannelBalancesTab
          period={period}
          selectedChannelId={channelId}
          onSelectChannel={(id) => update({ channel: id })}
          onOpenOrder={openOrder}
        />
      )}
      {tab === "commission" && <CommissionTab canManage={canManageCommission} />}
      {tab === "issues" && <ReconciliationTab onOpenOrder={openOrder} refreshKey={refreshKey} />}

      {orderId && (
        <OrderDrawer
          orderId={orderId}
          canRefund={canRefund}
          onClose={() => update({ order: null })}
          onChanged={() => setRefreshKey((n) => n + 1)}
        />
      )}
    </div>
  );
}
