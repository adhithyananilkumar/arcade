'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  ImagePlus,
  Loader2,
  Pencil,
  Send,
  Trash2,
} from 'lucide-react';
import type { BugCategory, BugImpact } from '../types/bug-report.types';
import { IMPACT_LABEL } from '../utils/labels';
import { BugImpactBadge, CategoryIcon } from './BugBadges';
import { ScreenshotAnnotator } from './ScreenshotAnnotator';
import { cn } from '@/shared/utils/utils';

export const MAX_SCREENSHOTS = 6;

export interface BugDraft {
  categoryId: string;
  title: string;
  description: string;
  expected: string;
  impact: BugImpact;
  includeDiagnostics: boolean;
  screenshots: Blob[];
}

interface Shot {
  id: string;
  blob: Blob;
  url: string;
}

const IMPACTS: BugImpact[] = ['MINOR', 'MAJOR', 'BLOCKER'];

/**
 * The report form: pick what kind of problem, describe it, attach screenshots. Two short steps so
 * a tester can file in under a minute; everything technical is captured for them.
 *
 * Pure: capturing the screen and sending are the caller's (`onCapture`, `onSubmit`).
 */
export function BugReportComposer({
  categories,
  intakeMessage,
  onCapture,
  onSubmit,
  onPickError,
}: {
  categories: BugCategory[];
  intakeMessage?: string | null;
  /** Grabs the current page as an image. Rejects if it couldn't. */
  onCapture: () => Promise<Blob>;
  onSubmit: (draft: BugDraft) => Promise<void>;
  onPickError?: (message: string) => void;
}) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [expected, setExpected] = useState('');
  const [impact, setImpact] = useState<BugImpact>('MAJOR');
  const [shots, setShots] = useState<Shot[]>([]);
  const [editing, setEditing] = useState<Shot | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const category = useMemo(() => categories.find((c) => c.id === categoryId) ?? null, [categories, categoryId]);

  useEffect(() => {
    if (category) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [category]);

  // Release object URLs when the composer goes away.
  const shotsRef = useRef(shots);
  useEffect(() => {
    shotsRef.current = shots;
  }, [shots]);
  useEffect(() => () => shotsRef.current.forEach((s) => URL.revokeObjectURL(s.url)), []);

  const addBlobs = (blobs: Blob[]) => {
    const room = MAX_SCREENSHOTS - shots.length;
    if (room <= 0) {
      onPickError?.(`You can attach up to ${MAX_SCREENSHOTS} screenshots.`);
      return;
    }
    const accepted = blobs.filter((b) => b.type.startsWith('image/')).slice(0, room);
    if (accepted.length < blobs.length) onPickError?.('Only images can be attached, up to ' + MAX_SCREENSHOTS + '.');
    setShots((prev) => [...prev, ...accepted.map((blob) => ({ id: crypto.randomUUID(), blob, url: URL.createObjectURL(blob) }))]);
  };

  const removeShot = (id: string) =>
    setShots((prev) => {
      const gone = prev.find((s) => s.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((s) => s.id !== id);
    });

  const replaceShot = (id: string, blob: Blob) =>
    setShots((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        URL.revokeObjectURL(s.url);
        return { id, blob, url: URL.createObjectURL(blob) };
      }),
    );

  const capture = async () => {
    setCapturing(true);
    try {
      addBlobs([await onCapture()]);
    } catch {
      onPickError?.("Couldn't capture this page. Take a screenshot yourself and add it with \"Add image\".");
    } finally {
      setCapturing(false);
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const images = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith('image/'));
    if (images.length) {
      e.preventDefault();
      addBlobs(images);
    }
  };

  const canSend = !!category && (title.trim().length >= 3 || description.trim().length >= 3) && !submitting;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !canSend) return;
    setSubmitting(true);
    try {
      await onSubmit({
        categoryId: category.id,
        title: title.trim() || description.trim().split('\n')[0].slice(0, 80),
        description: description.trim() || title.trim(),
        expected: expected.trim(),
        impact,
        includeDiagnostics: true,
        screenshots: shots.map((s) => s.blob),
      });
    } catch {
      // The caller reports failures; the draft stays so the reporter can retry.
    } finally {
      setSubmitting(false);
    }
  };

  if (!category) {
    return (
      <div className="space-y-3.5">
        <div>
          <p className="text-[13.5px] font-semibold text-slate-900">What kind of problem is it?</p>
          <p className="text-[11.5px] text-slate-500">Select a category that best matches the issue.</p>
        </div>

        {/* Category Selection Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id)}
              title={c.description ?? undefined}
              className="group relative flex cursor-pointer flex-col items-start rounded-2xl border border-slate-200/80 bg-surface p-3 text-left transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <CategoryIcon icon={c.icon} size={14} />
                </span>
                <ChevronRight
                  size={14}
                  className="text-slate-300 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </div>

              <div className="mt-2 min-w-0">
                <span className="block text-[12.5px] font-semibold leading-tight text-slate-900">
                  {c.label}
                </span>
                {c.description && (
                  <span className="mt-1 line-clamp-2 block text-[11px] leading-snug text-slate-400">
                    {c.description}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.14 }}
      onSubmit={submit}
      onPaste={onPaste}
      className="space-y-4"
    >
      {/* Category Chip Switcher */}
      <button
        type="button"
        onClick={() => setCategoryId(null)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-surface py-1 pl-2 pr-3 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
        title="Change the kind of problem"
      >
        <ArrowLeft size={12} className="text-slate-400" />
        <CategoryIcon icon={category.icon} size={13} className="text-indigo-500" />
        <span>{category.label}</span>
      </button>

      {/* Question 1: What happened? */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="bug-what-happened" className="block text-[12.5px] font-semibold text-slate-900">
            What happened? <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400">Brief summary of the issue</span>
        </div>
        <input
          id="bug-what-happened"
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={160}
          placeholder="e.g. Save button doesn't work on my profile"
          className="w-full rounded-xl border border-slate-200 bg-surface px-3.5 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/20"
        />
      </div>

      {/* Question 2: Describe */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="bug-describe" className="block text-[12.5px] font-semibold text-slate-900">
            Describe <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400">Steps, expected behavior, or context</span>
        </div>
        <textarea
          id="bug-describe"
          ref={textRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={8000}
          placeholder="Describe what you were doing, what went wrong, and what should happen..."
          className="w-full resize-none rounded-xl border border-slate-200 bg-surface px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/20"
        />
      </div>

      {/* Impact Level Segmented Buttons */}
      <div>
        <p className="mb-2 text-[12.5px] font-semibold text-slate-900">
          How much does it get in your way?
        </p>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Impact">
          {IMPACTS.map((value) => {
            const isSelected = impact === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setImpact(value)}
                className={cn(
                  'flex cursor-pointer select-none items-center justify-center gap-2 rounded-xl border px-2.5 py-2.5 text-center text-[12px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400',
                  isSelected ? 'border-ink bg-slate-50 text-slate-900 ring-1 ring-ink' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <BugImpactBadge impact={value} label={false} />
                <span className="leading-tight">{IMPACT_LABEL[value]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screenshots Area */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[12.5px] font-semibold text-slate-900">Screenshots</p>
          <span className="text-[11px] text-slate-400">
            {shots.length}/{MAX_SCREENSHOTS} · paste works too
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {shots.map((shot) => (
            <div key={shot.id} className="group relative h-16 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
              <img src={shot.url} alt="Screenshot" className="h-full w-full object-cover " />
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-slate-950/60 opacity-0 backdrop-blur-[1px] transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => setEditing(shot)}
                  aria-label="Annotate screenshot"
                  title="Draw on screenshot"
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-surface text-slate-700 shadow-xs transition hover:bg-slate-100"
                >
                  <Pencil size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => removeShot(shot.id)}
                  aria-label="Remove screenshot"
                  title="Remove"
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-rose-500 text-white shadow-xs transition hover:bg-rose-600"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
          {shots.length < MAX_SCREENSHOTS && (
            <>
              <button
                type="button"
                onClick={capture}
                disabled={capturing}
                className="flex h-16 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-surface text-[11px] font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
              >
                {capturing ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
                {capturing ? 'Capturing…' : 'This screen'}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-16 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-surface text-[11px] font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <ImagePlus size={15} />
                Add image
              </button>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            hidden
            onChange={(e) => {
              addBlobs(Array.from(e.target.files ?? []));
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!canSend}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-on-ink transition hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
        {submitting ? 'Sending report…' : 'Send report'}
      </button>

      {/* Screenshot Annotator Modal */}
      {editing && (
        <ScreenshotAnnotator
          image={editing.blob}
          onCancel={() => setEditing(null)}
          onDone={(blob) => {
            replaceShot(editing.id, blob);
            setEditing(null);
          }}
        />
      )}
    </motion.form>
  );
}
