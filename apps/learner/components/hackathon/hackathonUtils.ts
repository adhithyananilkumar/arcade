/** The server's message when it sent one; otherwise a fallback said plainly. */
export function errorText(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** Splits pasted text ("a@b.com, @dev, c@d.com") into distinct identifiers. */
export function splitIdentifiers(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[\s,;]+/)) {
    const v = part.trim();
    if (!v || seen.has(v.toLowerCase())) continue;
    seen.add(v.toLowerCase());
    out.push(v);
  }
  return out;
}

export const inputClass =
  'w-full rounded-2xl border border-slate-200/90 bg-surface px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-2xs transition focus:border-[#205ca8] focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60';

export const primaryButton =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-extrabold text-on-ink shadow-md transition hover:bg-ink-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

export const secondaryButton =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-surface px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

export const dangerButton =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-rose-200 bg-surface px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10';

export const panelClass = 'rounded-3xl border border-slate-200/80 bg-surface p-5 sm:p-6 shadow-[0_1px_0_rgba(15,23,42,0.04)]';
