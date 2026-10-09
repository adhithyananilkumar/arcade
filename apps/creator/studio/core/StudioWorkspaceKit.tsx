"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Creator — Studio Core
 *
 * The Content Overview design language, shared by every content type (course, event, exam).
 *
 * The course's "Overview & Outcomes" tab set the pattern; these are its parts, so the other
 * dashboards are built from the same pieces instead of copies of them:
 *
 * - `WorkspaceTabs`  — the centred pill bar; the active tab is the filled blue pill.
 * - `WorkspaceRows` / `WorkspaceRow` — open, numbered rows divided by hairlines: a 01/02/03 badge,
 *   a title and one line of help on the left, the control on the right. No boxed cards.
 * - `WorkspaceSaveBar` — the single dark "Save …" pill, bottom right, one per form.
 * - `WorkspaceHeading` — the same typography for tabs that are a list or a report, not a form.
 * - `workspaceField` — the input / textarea / select styling the rows use.
 *
 * Domain-neutral on purpose (see ARCHITECTURE.md): nothing here knows what a course, event or
 * exam is.
 * ------------------------------------------------------------------
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ChevronDown, Loader2, Save, type LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Tabs                                                              */
/* ------------------------------------------------------------------ */

export interface WorkspaceTab<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
  /** A small count or marker after the label, e.g. pending items. */
  badge?: string | number | null;
  /** Kept under "More" so the bar stays scannable; shown in place of "More" while it is open. */
  secondary?: boolean;
}

export function WorkspaceTabs<T extends string>({
  tabs,
  active,
  onChange,
  ariaLabel = "Sections",
}: {
  tabs: WorkspaceTab<T>[];
  active: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
}) {
  const primary = tabs.filter((t) => !t.secondary);
  const secondary = tabs.filter((t) => t.secondary);
  const activeSecondary = secondary.find((t) => t.id === active);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const close = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMoreOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [moreOpen]);

  const pill = (selected: boolean) =>
    `inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold transition-all ${
      selected ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
    }`;
  const badge = (tab: WorkspaceTab<T>, selected: boolean) =>
    tab.badge != null && tab.badge !== "" && tab.badge !== 0 ? (
      <span className={`rounded-full px-1.5 py-px text-[10px] font-black ${selected ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"}`}>
        {tab.badge}
      </span>
    ) : null;

  const MoreIcon = activeSecondary?.icon;
  return (
    <div className="flex items-center justify-center">
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-200/80 bg-surface/95 p-1.5 shadow-[0_4px_20px_rgba(20,20,43,0.04)] backdrop-blur-md scrollbar-none"
      >
        {primary.map((tab) => {
          const selected = tab.id === active;
          const Icon = tab.icon;
          return (
            <button key={tab.id} type="button" role="tab" aria-selected={selected} onClick={() => onChange(tab.id)} className={pill(selected)}>
              <Icon size={14} className={selected ? "text-white" : "text-slate-400"} />
              {tab.label}
              {badge(tab, selected)}
            </button>
          );
        })}
        {secondary.length > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={!!activeSecondary}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((o) => !o)}
            className={pill(!!activeSecondary)}
          >
            {MoreIcon && <MoreIcon size={14} className="text-white" />}
            {activeSecondary ? activeSecondary.label : "More"}
            <ChevronDown size={14} className={`transition-transform ${moreOpen ? "rotate-180" : ""} ${activeSecondary ? "text-white" : "text-slate-400"}`} />
          </button>
        )}
      </div>
      {secondary.length > 0 && (
        // Zero-width anchor at the bar's right end: the menu hangs from there, outside the bar,
        // whose horizontal scroll would otherwise clip it.
        <div ref={moreRef} className="relative">
          {moreOpen && (
            <div role="menu" className="absolute right-0 top-8 z-30 w-56 rounded-2xl border border-slate-200 bg-surface p-1.5 shadow-xl">
              {secondary.map((tab) => {
                const selected = tab.id === active;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMoreOpen(false);
                      onChange(tab.id);
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold ${
                      selected ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={14} className={selected ? "" : "text-slate-400"} />
                    {tab.label}
                    {badge(tab, false)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Space between the tab bar and the tab's body. */
export function WorkspaceTabBody({ children }: { children: ReactNode }) {
  return <div className="pt-6 sm:pt-8">{children}</div>;
}

/* ------------------------------------------------------------------ */
/*  Numbered rows                                                     */
/* ------------------------------------------------------------------ */

export function WorkspaceRows({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-col gap-8">{children}</div>;
}

export function WorkspaceStep({ n }: { n: number | string }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-sm font-extrabold text-[#205ca8] shadow-2xs dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
      {typeof n === "number" ? String(n).padStart(2, "0") : n}
    </div>
  );
}

/**
 * One numbered row: what it is on the left, the control on the right. `wide` gives the control
 * the full width under the heading — for tables and two-column editors that need the room.
 */
export function WorkspaceRow({
  step,
  title,
  description,
  aside,
  wide = false,
  id,
  children,
}: {
  step: number | string;
  title: ReactNode;
  description?: ReactNode;
  /** Under the description: a status chip, a link, a secondary action. */
  aside?: ReactNode;
  wide?: boolean;
  id?: string;
  children?: ReactNode;
}) {
  const heading = (
    <div className="flex items-start gap-3.5">
      <WorkspaceStep n={step} />
      <div className="flex min-w-0 flex-col">
        <h4 className="text-base font-extrabold text-slate-900">{title}</h4>
        {description && <div className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{description}</div>}
        {aside && <div className="mt-3 flex flex-wrap items-center gap-2">{aside}</div>}
      </div>
    </div>
  );

  if (wide) {
    return (
      <section id={id} className="flex flex-col gap-6 py-1">
        {heading}
        {children && <div className="min-w-0 md:pl-[3.375rem]">{children}</div>}
      </section>
    );
  }

  return (
    <section id={id} className="grid grid-cols-1 items-start gap-6 py-1 md:grid-cols-12">
      <div className="md:col-span-4">{heading}</div>
      <div className="flex min-w-0 flex-col gap-1.5 md:col-span-8">{children}</div>
    </section>
  );
}

export function WorkspaceLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-xs font-semibold text-slate-400" role="status">
      <Loader2 size={20} className="animate-spin text-[#205ca8] dark:text-[#7cbaff]" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** A load failure or empty state, centred and unboxed. */
export function WorkspaceMessage({
  icon: Icon,
  title,
  children,
  action,
  tone = "neutral",
}: {
  icon?: LucideIcon;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "warning";
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      {Icon && (
        <div
          className={`mb-1 flex size-11 items-center justify-center rounded-2xl border ${
            tone === "warning"
              ? "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300"
              : "border-blue-100 bg-blue-50 text-[#205ca8] dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400"
          }`}
        >
          <Icon size={20} />
        </div>
      )}
      <p className="text-sm font-extrabold text-slate-900">{title}</p>
      {children && <p className="max-w-md text-xs font-medium leading-relaxed text-slate-500">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** A tab with nothing to configure yet, said plainly in the row language. */
export function WorkspaceNote({ children }: { children: ReactNode }) {
  return <p className="text-xs font-medium leading-relaxed text-slate-500">{children}</p>;
}

/* ------------------------------------------------------------------ */
/*  Save                                                              */
/* ------------------------------------------------------------------ */

export function WorkspaceSaveBar({
  onSave,
  saving,
  dirty = true,
  disabled = false,
  label = "Save changes",
  savedLabel = "Saved",
  type = "button",
  secondary,
}: {
  onSave?: () => void;
  saving: boolean;
  /** When false the button reads `savedLabel` and is disabled. */
  dirty?: boolean;
  disabled?: boolean;
  label?: string;
  savedLabel?: string;
  /** "submit" when the bar sits inside a <form>. */
  type?: "button" | "submit";
  /** Left of the save button: e.g. "Reset" or "Always open". */
  secondary?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-6">
      {secondary}
      <WorkspacePrimaryButton
        type={type}
        onClick={onSave}
        disabled={saving || disabled || !dirty}
        icon={saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        trailingArrow
      >
        {saving ? "Saving…" : dirty ? label : savedLabel}
      </WorkspacePrimaryButton>
    </div>
  );
}

export function WorkspacePrimaryButton({
  children,
  icon,
  onClick,
  disabled,
  type = "button",
  trailingArrow = false,
}: {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  trailingArrow?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-ink px-8 py-3 text-xs font-extrabold text-on-ink shadow-md transition-all hover:bg-[#205ca8] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
    >
      {icon}
      <span>{children}</span>
      {trailingArrow && <ArrowRight size={15} />}
    </button>
  );
}

/** The quiet companion to the primary pill: outline, same shape. */
export const workspaceSecondaryButton =
  "inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200/90 bg-surface px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

/* ------------------------------------------------------------------ */
/*  Headings for non-form tabs                                        */
/* ------------------------------------------------------------------ */

export function WorkspaceHeading({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/70 pb-5">
      <div className="flex min-w-0 items-start gap-3.5">
        {Icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-[#205ca8] shadow-2xs dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
            <Icon size={18} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-extrabold tracking-tight text-slate-900">{title}</h3>
          {description && <p className="mt-1 max-w-2xl text-xs font-medium leading-relaxed text-slate-500">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Fields                                                            */
/* ------------------------------------------------------------------ */

const fieldBase =
  "w-full rounded-2xl border border-slate-200/90 bg-surface text-sm text-slate-800 placeholder-slate-400 shadow-2xs transition focus:border-[#205ca8] focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70 dark:focus:border-blue-400";

export const workspaceField = {
  input: `${fieldBase} px-4 py-3.5`,
  /** Pair with an absolutely positioned icon at left-4. */
  inputWithIcon: `${fieldBase} py-3.5 pl-11 pr-4`,
  textarea: `${fieldBase} min-h-[140px] p-4 leading-relaxed`,
  select: `${fieldBase} cursor-pointer px-4 py-3.5`,
};

/** Small caption above a control when a row holds more than one. */
export function WorkspaceLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </label>
  );
}

/** One-of-several choice as pills — the row-design replacement for tiles and radio cards. */
export function WorkspaceChoice<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  const withHints = options.some((o) => o.hint);
  return (
    <div role="radiogroup" className={withHints ? "grid gap-2.5 sm:grid-cols-2" : "flex flex-wrap gap-2"}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`cursor-pointer text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              withHints ? "rounded-2xl border px-4 py-3" : "rounded-full border px-4 py-2 text-xs font-bold"
            } ${
              selected
                ? "border-[#205ca8] bg-blue-50/80 text-[#205ca8] ring-1 ring-[#205ca8] dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400"
                : "border-slate-200/90 bg-surface text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {withHints ? (
              <>
                <span className="block text-xs font-bold">{option.label}</span>
                {option.hint && <span className="mt-0.5 block text-[11px] font-medium leading-relaxed text-slate-500">{option.hint}</span>}
              </>
            ) : (
              option.label
            )}
          </button>
        );
      })}
    </div>
  );
}

/** A figure in a stats strip: open, no tile. */
export function WorkspaceStat({ label, value, hint, icon: Icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: LucideIcon }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {Icon && <Icon size={13} className="text-[#205ca8] dark:text-blue-400" />}
        {label}
      </span>
      <span className="truncate text-2xl font-black tracking-tight text-ink">{value}</span>
      {hint && <span className="text-[11px] font-medium leading-snug text-slate-400">{hint}</span>}
    </div>
  );
}
