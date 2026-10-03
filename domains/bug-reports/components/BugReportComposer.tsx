'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  ChevronRight,
  ImagePlus,
  Info,
  Loader2,
  Pencil,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { BugCategory, BugImpact } from '../types/bug-report.types';
import { IMPACT_LABEL } from '../utils/labels';
import { CategoryIcon } from './BugBadges';
import { ScreenshotAnnotator } from './ScreenshotAnnotator';

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
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [shots, setShots] = useState<Shot[]>([]);
  const [editing, setEditing] = useState<Shot | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const category = useMemo(() => categories.find((c) => c.id === categoryId) ?? null, [categories, categoryId]);

  useEffect(() => {
    if (category) textRef.current?.focus();
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

  const canSend = !!category && description.trim().length >= 3 && !submitting;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !canSend) return;
    setSubmitting(true);
    try {
      await onSubmit({
        categoryId: category.id,
        title: title.trim(),
        description: description.trim(),
        expected: expected.trim(),
        impact,
        includeDiagnostics,
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
        {/* Helper Banner */}
        {intakeMessage && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3 text-[12.5px] leading-relaxed text-indigo-900/90 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200">
            <Sparkles size={15} className="mt-0.5 shrink-0 text-indigo-500 dark:text-indigo-400" />
            <p className="flex-1">{intakeMessage}</p>
          </div>
        )}

        <div>
          <p className="text-[13.5px] font-bold text-slate-900">What kind of problem is it?</p>
          <p className="text-[11.5px] text-slate-500">Select a category that best matches the issue.</p>
        </div>

        {/* Category Selection Grid */}
        <div className="grid grid-cols-2 gap-2">
          {categories.map((c, i) => (
            <motion.button
              key={c.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025, duration: 0.2 }}
              whileHover={{ y: -2, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCategoryId(c.id)}
              title={c.description ?? undefined}
              className="group relative flex cursor-pointer flex-col items-start rounded-2xl border border-slate-200/80 bg-surface p-3 text-left shadow-xs transition-colors duration-150 hover:border-indigo-300 hover:bg-slate-50/80 hover:shadow-md hover:shadow-indigo-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:hover:border-indigo-500/40"
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors duration-200 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500">
                  <CategoryIcon icon={c.icon} size={14} />
                </span>
                <ChevronRight
                  size={14}
                  className="text-slate-300 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </div>

              <div className="mt-2 min-w-0">
                <span className="block text-[12.5px] font-bold leading-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {c.label}
                </span>
                {c.description && (
                  <span className="mt-1 line-clamp-2 block text-[11px] leading-snug text-slate-400">
                    {c.description}
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.18 }}
      onSubmit={submit}
      onPaste={onPaste}
      className="space-y-4"
    >
      {/* Category Chip Switcher */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => setCategoryId(null)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface py-1 pl-2 pr-3 text-[12px] font-semibold text-slate-700 shadow-xs transition hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-600 dark:hover:border-indigo-500/40 dark:hover:text-indigo-400"
        title="Change the kind of problem"
      >
        <ArrowLeft size={12} className="text-slate-400" />
        <CategoryIcon icon={category.icon} size={13} className="text-indigo-500" />
        <span>{category.label}</span>
      </motion.button>

      {/* Description */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="bug-description" className="block text-[12.5px] font-bold text-slate-900">
            What happened? <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400">Be as descriptive as you can</span>
        </div>
        <textarea
          id="bug-description"
          ref={textRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={8000}
          placeholder="e.g. I clicked “Save” on my profile and nothing happened."
          className="w-full resize-none rounded-2xl border border-slate-200/90 bg-surface px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
        />
      </div>

      {/* Impact Level Segmented Buttons */}
      <div>
        <p className="mb-1.5 text-[12.5px] font-bold text-slate-900">
          How much does it get in your way?
        </p>
        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Impact">
          {IMPACTS.map((value) => {
            const isSelected = impact === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setImpact(value)}
                className={`relative cursor-pointer rounded-xl border px-2 py-2 text-[11.5px] font-bold leading-tight transition-all duration-150 ${
                  isSelected
                    ? value === 'BLOCKER'
                      ? 'border-rose-400 bg-rose-50 text-rose-700 shadow-xs dark:border-rose-500/50 dark:bg-rose-500/15 dark:text-rose-300'
                      : value === 'MAJOR'
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs dark:border-indigo-500 dark:bg-indigo-600'
                      : 'border-emerald-600 bg-emerald-600 text-white shadow-xs dark:border-emerald-500 dark:bg-emerald-600'
                    : 'border-slate-200/80 bg-surface text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {IMPACT_LABEL[value]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Screenshots Area */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[12.5px] font-bold text-slate-900">Screenshots</p>
          <span className="text-[11px] text-slate-400">
            {shots.length}/{MAX_SCREENSHOTS} · paste works too
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {shots.map((shot) => (
            <motion.div
              key={shot.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="group relative h-16 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
              <img src={shot.url} alt="Screenshot" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-slate-950/60 opacity-0 backdrop-blur-[1px] transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => setEditing(shot)}
                  aria-label="Annotate screenshot"
                  title="Draw on screenshot"
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-surface text-slate-700 shadow-xs transition hover:scale-110 hover:bg-slate-100"
                >
                  <Pencil size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => removeShot(shot.id)}
                  aria-label="Remove screenshot"
                  title="Remove"
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-rose-500 text-white shadow-xs transition hover:scale-110 hover:bg-rose-600"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </motion.div>
          ))}
          {shots.length < MAX_SCREENSHOTS && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={capture}
                disabled={capturing}
                className="flex h-16 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300/90 bg-surface text-[11px] font-semibold text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50/30 hover:text-indigo-600 disabled:cursor-wait disabled:opacity-60 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
              >
                {capturing ? <Loader2 size={15} className="animate-spin text-indigo-600 dark:text-indigo-400" /> : <Camera size={15} />}
                {capturing ? 'Capturing…' : 'This screen'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-16 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300/90 bg-surface text-[11px] font-semibold text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50/30 hover:text-indigo-600 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
              >
                <ImagePlus size={15} />
                Add image
              </motion.button>
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

      {/* Collapsible Additional Details */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/60">
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className="flex w-full cursor-pointer items-center justify-between px-3.5 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <span>
            Add more detail <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${moreOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
          />
        </button>

        <AnimatePresence>
          {moreOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 px-3.5 pb-3.5"
            >
              <div>
                <label htmlFor="bug-title" className="mb-1 block text-[11.5px] font-semibold text-slate-600">
                  Short summary / title
                </label>
                <input
                  id="bug-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={160}
                  placeholder="We'll use your first line if you leave this empty"
                  className="w-full rounded-xl border border-slate-200/90 bg-surface px-3 py-2 text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
              <div>
                <label htmlFor="bug-expected" className="mb-1 block text-[11.5px] font-semibold text-slate-600">
                  What did you expect to happen instead?
                </label>
                <textarea
                  id="bug-expected"
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                  rows={2}
                  maxLength={4000}
                  placeholder="e.g. A success toast should appear and redirect to dashboard"
                  className="w-full resize-none rounded-xl border border-slate-200/90 bg-surface px-3 py-2 text-[12.5px] text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Technical Diagnostics Checkbox */}
      <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-transparent p-1 text-[12px] text-slate-600 transition hover:text-slate-900">
        <input
          type="checkbox"
          checked={includeDiagnostics}
          onChange={(e) => setIncludeDiagnostics(e.target.checked)}
          className="mt-0.5 h-4 w-4 cursor-pointer rounded accent-indigo-600"
        />
        <span className="leading-snug">
          Include technical details
          <span className="group relative ml-1 inline-flex align-middle">
            <Info size={13} className="text-slate-400 transition hover:text-indigo-600 dark:hover:text-indigo-400" />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-60 -translate-x-1/2 rounded-xl bg-slate-900/95 p-2.5 text-[11px] leading-relaxed text-on-ink opacity-0 shadow-xl backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100">
              Captures current route, browser specs, screen resolution, and recent console errors. Never passwords, form contents or sensitive credentials.
            </span>
          </span>
        </span>
      </label>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: canSend ? 1.015 : 1 }}
        whileTap={{ scale: canSend ? 0.98 : 1 }}
        type="submit"
        disabled={!canSend}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-bold text-on-ink shadow-md shadow-slate-900/10 transition hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
        {submitting ? 'Sending report…' : 'Send report'}
      </motion.button>

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
