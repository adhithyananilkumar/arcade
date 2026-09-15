import React from 'react';
import { PackageOpen } from 'lucide-react';

export function EmptyState({ title = 'No content found', message = 'There are currently no items in this section.' }: { title?: string, message?: string }) {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4 shadow-sm">
        <PackageOpen size={32} />
      </div>
      <h3 className="text-sm font-black text-slate-900">{title}</h3>
      <p className="mt-1.5 text-xs font-semibold text-slate-500 max-w-sm">{message}</p>
    </div>
  );
}
