"use client";

import { usePublicCategories } from "@/shared/hooks/usePublicCategories";

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-ink/30 focus:bg-surface focus:ring-4 focus:ring-slate-200/60";

/**
 * The "basics" every piece of content needs before it can be reviewed, shared by the creation
 * modals and the submit dialog so the two ask for exactly the same things in the same way.
 *
 * Which fields are required is the backend's call (it validates on submit); this only gives the
 * author somewhere to fill them in up front instead of discovering the gap at submit time.
 */
export function DescriptionField({
  id,
  value,
  onChange,
  label = "Description",
  placeholder = "What is this about, and who is it for?",
  required = true,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-ink">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={2000}
        className={`${INPUT_CLASS} resize-y`}
      />
    </div>
  );
}

/** Free-text category with the Console-managed categories offered as suggestions. */
export function CategoryField({
  id,
  value,
  onChange,
  type,
  required = true,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  /** Which managed category list to suggest from (e.g. "EVENTS"). */
  type: "COURSES" | "EVENTS" | "EXAMS";
  required?: boolean;
}) {
  const categories = usePublicCategories().filter((c) => c.type === type || c.type === "ALL");
  const listId = `${id}-options`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-ink">
        Category {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        id={id}
        type="text"
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Programming"
        maxLength={80}
        className={INPUT_CLASS}
      />
      <datalist id={listId}>
        {categories.map((c) => (
          <option key={c.id} value={c.name} />
        ))}
      </datalist>
    </div>
  );
}

/** The two-way "Free / Paid" choice plus the amount (in major units, e.g. rupees). */
export interface PriceValue {
  paid: boolean;
  amount: string;
}

export function PriceField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: PriceValue;
  onChange: (v: PriceValue) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">Pricing</span>
      <div className="flex items-center gap-2">
        {[false, true].map((paid) => (
          <button
            key={String(paid)}
            type="button"
            onClick={() => onChange({ ...value, paid })}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              value.paid === paid
                ? "border-ink bg-ink text-on-ink"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {paid ? "Paid" : "Free"}
          </button>
        ))}
        {value.paid && (
          <input
            id={id}
            type="number"
            min={1}
            step="1"
            inputMode="decimal"
            value={value.amount}
            onChange={(e) => onChange({ ...value, amount: e.target.value })}
            placeholder="Price in ₹"
            aria-label="Price in rupees"
            className={`${INPUT_CLASS} !w-36`}
          />
        )}
      </div>
    </div>
  );
}

/** Whether a PriceValue is complete enough to save (a paid item needs an amount above zero). */
export function isPriceValid(v: PriceValue): boolean {
  return !v.paid || Number(v.amount) > 0;
}

/** Major units -> the minor units every backend price field stores. */
export function toMinor(v: PriceValue): number {
  return v.paid ? Math.round(Number(v.amount) * 100) : 0;
}

export function CapacityField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-ink">
        Capacity <span className="font-normal text-slate-400">(optional — blank means unlimited)</span>
      </label>
      <input
        id={id}
        type="number"
        min={1}
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 50"
        className={INPUT_CLASS}
      />
    </div>
  );
}

export function OutcomesField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-ink">
        Learning outcomes <span className="font-normal text-slate-400">(one per line)</span>
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"Build a REST API\nDeploy it to production"}
        rows={3}
        className={`${INPUT_CLASS} resize-y`}
      />
    </div>
  );
}

/** A first-Day date and start time, so the event has a schedule from the moment it exists. */
export function FirstDayField({
  idPrefix,
  date,
  time,
  onDate,
  onTime,
}: {
  idPrefix: string;
  date: string;
  time: string;
  onDate: (v: string) => void;
  onTime: (v: string) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">
        First day <span className="text-rose-500">*</span>
      </span>
      <div className="grid grid-cols-2 gap-3">
        <input
          id={`${idPrefix}-date`}
          type="date"
          value={date}
          onChange={(e) => onDate(e.target.value)}
          aria-label="First day date"
          className={INPUT_CLASS}
        />
        <input
          id={`${idPrefix}-time`}
          type="time"
          value={time}
          onChange={(e) => onTime(e.target.value)}
          aria-label="First day start time"
          className={INPUT_CLASS}
        />
      </div>
    </div>
  );
}
