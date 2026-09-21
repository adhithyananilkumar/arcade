'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * The handle input: live availability, alternatives when a name is taken, and
 * the route to an appeal when it is taken by somebody who should not have it.
 *
 * Rules:
 * - Availability comes from the server via `useHandleAvailability`. Claiming is
 *   the caller's job (`onClaim`), because only the application layer knows
 *   whether this is a user's handle or a channel's and what to do afterwards.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useState } from 'react';
import { AlertCircle, Check, Gavel, Loader2, Lock } from 'lucide-react';
import { useHandleAvailability } from '../hooks/useHandleAvailability';
import { normalizeHandle } from '../api/handle.service';

export interface HandleFieldProps {
  /** The handle the subject holds today, or null if it has never claimed one. */
  currentHandle?: string | null;
  /** Present when this field is for a channel; changes who availability is asked for. */
  channelId?: string;
  /** Persists the new handle. Rejecting with an Error message surfaces it inline. */
  onClaim: (handle: string) => Promise<void>;
  /**
   * Opens the appeal flow. Only offered when the server says the refusal is contestable —
   * a malformed name never is, because no decision could make it servable.
   */
  onAppeal?: (handle: string) => void;
  label?: string;
  description?: string;
}

export function HandleField({
  currentHandle,
  channelId,
  onClaim,
  onAppeal,
  label = 'Handle',
  description,
}: HandleFieldProps) {
  const [value, setValue] = useState(currentHandle ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { checking, result, shapeError, unchanged } = useHandleAvailability(
    value,
    currentHandle,
    channelId,
  );

  const normalized = normalizeHandle(value);
  const canSave =
    !!normalized && !unchanged && !shapeError && !!result?.claimable && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onClaim(normalized);
      setSaved(true);
      // The confirmation is transient on purpose: a permanent "Saved" next to an editable field
      // goes stale the moment the value changes again.
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save that handle.');
    } finally {
      setSaving(false);
    }
  };

  const statusLine = () => {
    if (shapeError)
      return { tone: 'error' as const, icon: AlertCircle, text: shapeError };
    if (unchanged)
      return {
        tone: 'muted' as const,
        icon: Check,
        text: 'This is your current handle.',
      };
    if (checking)
      return { tone: 'muted' as const, icon: Loader2, text: 'Checking…' };
    if (!result) return null;
    if (result.claimable)
      return {
        tone: 'ok' as const,
        icon: Check,
        text: `@${result.normalized} is available.`,
      };
    return {
      tone: 'error' as const,
      icon: result.availability === 'RESERVED' ? Lock : AlertCircle,
      text: result.message ?? 'That handle is not available.',
    };
  };

  const status = statusLine();

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="arcade-handle"
          className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200"
        >
          {label}
        </label>
        {description && (
          <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-400 dark:text-neutral-500">
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex flex-1 items-center overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors focus-within:border-slate-900 dark:border-neutral-800 dark:bg-black dark:focus-within:border-neutral-400">
          <span className="pl-3.5 pr-1 text-[14px] font-bold text-slate-300 dark:text-neutral-600">
            @
          </span>
          <input
            id="arcade-handle"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            spellCheck={false}
            autoComplete="off"
            maxLength={30}
            placeholder="your-handle"
            className="w-full bg-transparent py-2.5 pr-3 text-[14px] font-semibold tracking-tight text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-300 dark:text-white dark:placeholder:text-neutral-700"
          />
          {checking && (
            <Loader2
              size={15}
              className="mr-3 shrink-0 animate-spin text-slate-300 dark:text-neutral-600"
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-extrabold tracking-tight text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {status && (
        <p
          className={`flex items-center gap-1.5 text-[12px] font-bold ${
            status.tone === 'ok'
              ? 'text-emerald-600 dark:text-emerald-400'
              : status.tone === 'error'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-400 dark:text-neutral-500'
          }`}
        >
          <status.icon
            size={13}
            className={checking && status.icon === Loader2 ? 'animate-spin' : ''}
          />
          {status.text}
        </p>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-[12px] font-bold text-rose-600 dark:text-rose-400">
          <AlertCircle size={13} /> {error}
        </p>
      )}

      {result && !result.claimable && result.suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11.5px] font-bold text-slate-400 dark:text-neutral-500">
            Try
          </span>
          {result.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setValue(suggestion)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[12px] font-bold text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-900 dark:border-neutral-800 dark:bg-black dark:text-neutral-300 dark:hover:border-neutral-400 dark:hover:text-white"
            >
              @{suggestion}
            </button>
          ))}
        </div>
      )}

      {result?.appealable && onAppeal && (
        <button
          type="button"
          onClick={() => onAppeal(result.normalized)}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-[12.5px] font-extrabold tracking-tight text-amber-700 transition-colors hover:border-amber-300 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/50"
        >
          <Gavel size={13} />
          Appeal for @{result.normalized}
        </button>
      )}
    </div>
  );
}
