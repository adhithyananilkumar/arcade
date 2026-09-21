'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Creating a custom badge definition — the "give this individual a special
 * badge" case the system catalog does not cover.
 *
 * Rules:
 * - Only custom definitions are created here. System badges are declared in the
 *   backend's RecognitionBootstrap and rewritten on every restart, so an edit
 *   made through the API would be silently reverted; the backend refuses those
 *   and this dialog never offers them.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import {
  BADGE_ICON_NAMES,
  BadgeIcon,
  RecognitionService,
  VerifiedBadge,
  type BadgeAppliesTo,
  type BadgeEffect,
} from '@/domains/recognition';

const PRESET_COLORS = [
  '#1d9bf0',
  '#7c3aed',
  '#d946ef',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#0ea5e9',
  '#64748b',
];

/** Upper snake case, mirroring the backend's `CreateBadgeDefinitionRequest` pattern. */
function toCode(displayName: string): string {
  return displayName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);
}

export function BadgeDefinitionDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [appliesTo, setAppliesTo] = useState<BadgeAppliesTo>('USER');
  const [icon, setIcon] = useState('award');
  const [accentColor, setAccentColor] = useState('#7c3aed');
  const [effect, setEffect] = useState<BadgeEffect>('GLOW');
  const [submitting, setSubmitting] = useState(false);

  // Derived rather than a second field: a code nobody types is a code nobody gets wrong, and it
  // is immutable once created, so letting it drift from the name helps no one.
  const code = useMemo(() => toCode(displayName), [displayName]);
  const canSubmit = displayName.trim().length >= 3 && code.length >= 3 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await RecognitionService.createDefinition({
        code,
        displayName: displayName.trim(),
        description: description.trim() || undefined,
        // Everything created here is a one-off award; verification and staff badges are the
        // platform's own and are declared in the backend bootstrap.
        category: 'CUSTOM',
        appliesTo,
        icon,
        accentColor,
        effect,
      });
      toast.success(`${displayName.trim()} created`);
      onCreated();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not create that badge.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm dark:bg-black/60">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[22px] border border-slate-100 bg-white p-6 shadow-2xl dark:border-neutral-900 dark:bg-black">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[17px] font-extrabold tracking-tight text-slate-900 dark:text-white">
              New custom badge
            </h2>
            <p className="mt-1 text-[12.5px] font-medium text-slate-500 dark:text-neutral-400">
              For recognition the standard catalog doesn&apos;t cover. Once
              created it can be granted to anyone it applies to.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:text-neutral-600 dark:hover:bg-neutral-900"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live preview: the effect and colour choices are hard to judge as form values. */}
        <div className="mt-6 flex items-center justify-center gap-3 rounded-[18px] border border-slate-100 bg-slate-50/60 py-7 dark:border-neutral-900 dark:bg-neutral-950">
          <span className="text-[16px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            {displayName.trim() || 'Badge preview'}
          </span>
          <VerifiedBadge
            badge={{
              code: code || 'PREVIEW',
              label: displayName.trim() || 'Badge preview',
              description,
              category: 'CUSTOM',
              icon,
              accentColor,
              effect,
              displayOrder: 100,
              grantedAt: new Date().toISOString(),
            }}
            size={24}
            showDetailOnHover={false}
          />
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200">
              Name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={120}
              placeholder="Community Mentor"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-slate-900 outline-none focus:border-slate-900 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-400"
            />
            {code && (
              <p className="mt-1.5 font-mono text-[11px] font-bold text-slate-400 dark:text-neutral-600">
                {code}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200">
              Description
            </label>
            <p className="mt-1 text-[11.5px] font-medium text-slate-400 dark:text-neutral-500">
              Shown on the hover card when a grant has no note of its own.
            </p>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Supports new learners in the Arcade community."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-slate-900 outline-none focus:border-slate-900 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200">
              Applies to
            </label>
            <div className="mt-2 flex gap-2">
              {(['USER', 'CHANNEL', 'ANY'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAppliesTo(option)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-[12.5px] font-extrabold tracking-tight transition-colors ${
                    appliesTo === option
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-slate-200 text-slate-500 dark:border-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  {option === 'USER'
                    ? 'People'
                    : option === 'CHANNEL'
                      ? 'Channels'
                      : 'Both'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200">
              Icon
            </label>
            <div className="mt-2 grid grid-cols-9 gap-1.5">
              {BADGE_ICON_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setIcon(name)}
                  aria-label={name}
                  className={`flex aspect-square items-center justify-center rounded-lg border transition-colors ${
                    icon === name
                      ? 'border-slate-900 bg-slate-50 dark:border-neutral-400 dark:bg-neutral-900'
                      : 'border-slate-200 hover:border-slate-300 dark:border-neutral-800'
                  }`}
                >
                  <BadgeIcon
                    name={name}
                    size={15}
                    className="text-slate-600 dark:text-neutral-300"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200">
              Colour
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccentColor(color)}
                  aria-label={color}
                  style={{ backgroundColor: color }}
                  className={`h-8 w-8 rounded-lg transition-transform ${
                    accentColor === color
                      ? 'ring-2 ring-slate-900 ring-offset-2 dark:ring-white dark:ring-offset-black'
                      : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200">
              Effect
            </label>
            <div className="mt-2 flex gap-2">
              {(['NONE', 'GLOW', 'PRISM'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setEffect(option)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-[12.5px] font-extrabold tracking-tight transition-colors ${
                    effect === option
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-slate-200 text-slate-500 dark:border-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  {option === 'NONE' ? 'Flat' : option === 'GLOW' ? 'Glow' : 'Prism'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-[13px] font-extrabold tracking-tight text-slate-500 transition-colors hover:bg-slate-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-extrabold tracking-tight text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {submitting ? 'Creating…' : 'Create badge'}
          </button>
        </div>
      </div>
    </div>
  );
}
