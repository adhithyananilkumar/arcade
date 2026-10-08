'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMoney } from '@/shared/utils/money';

export interface MonthlyPaymentsPoint {
  month: string;
  Collected: number;
  Refunded: number;
  Commission: number;
}

/**
 * The monthly bar chart of ChannelPaymentsReport, in its own module so recharts (~450 KB of
 * script) is only downloaded where the chart is actually drawn — the payment barrel is reachable
 * from pages that never show it, the Studio editor among them.
 */
export default function ChannelPaymentsMonthlyChart({ monthly, currency }: { monthly: MonthlyPaymentsPoint[]; currency: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={monthly} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value) => formatMoney(Math.round(Number(value) * 100), currency)}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Collected" fill="#4c6fff" radius={[6, 6, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Refunded" fill="#f472b6" radius={[6, 6, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Commission" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
