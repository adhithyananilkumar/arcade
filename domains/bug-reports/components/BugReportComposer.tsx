'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Camera, ChevronDown, ImagePlus, Info, Loader2, Pencil, Send, X } from 'lucide-react';
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
      <div className="space-y-3">
        {intakeMessage && <p className="text-[12.5px] leading-relaxed text-slate-500">{intakeMessage}</p>}
        <p className="text-[13px] font-semibold text-slate-800">What kind of problem is it?</p>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id)}
              title={c.description ?? undefined}
              className="group flex cursor-pointer items-start gap-2.5 rounded-2xl border border-slate-200/80 bg-surface px-3 py-2.5 text-left transition hover:-translate-y-px hover:border-slate-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-ink group-hover:text-on-ink">
                <CategoryIcon icon={c.icon} size={14} />
              </span>
              <span className="min-w-0">
                <span className="block text-[12.5px] font-semibold leading-tight text-slate-800">{c.label}</span>
                {c.description && <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-slate-400">{c.description}</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} onPaste={onPaste} className="space-y-4">
      <button
        type="button"
        onClick={() => setCategoryId(null)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-surface py-1 pl-1.5 pr-3 text-[12px] font-semibold text-slate-700 hover:border-slate-300"
        title="Change the kind of problem"
      >
        <ArrowLeft size={12} className="text-slate-400" />
        <CategoryIcon icon={category.icon} size={13} className="text-slate-500" />
        {category.label}
      </button>

      <div>
        <label htmlFor="bug-description" className="mb-1.5 block text-[12.5px] font-semibold text-slate-800">
          What happened?
        </label>
        <textarea
          id="bug-description"
          ref={textRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={8000}
          placeholder="e.g. I clicked “Save” on my profile and nothing happened."
          className="w-full resize-none rounded-2xl border border-slate-200 bg-surface px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
        />
      </div>

      <div>
        <p className="mb-1.5 text-[12.5px] font-semibold text-slate-800">How much does it get in your way?</p>
        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Impact">
          {IMPACTS.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={impact === value}
              onClick={() => setImpact(value)}
              className={`cursor-pointer rounded-xl border px-2 py-2 text-[11.5px] font-semibold leading-tight transition ${
                impact === value
                  ? value === 'BLOCKER'
                    ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300'
                    : 'border-ink bg-ink text-on-ink'
                  : 'border-slate-200 bg-surface text-slate-600 hover:border-slate-300'
              }`}
            >
              {IMPACT_LABEL[value]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[12.5px] font-semibold text-slate-800">Screenshots</p>
          <span className="text-[11px] text-slate-400">
            {shots.length}/{MAX_SCREENSHOTS} · paste works too
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {shots.map((shot) => (
            <div key={shot.id} className="group relative h-16 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
              <img src={shot.url} alt="Screenshot" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-slate-900/50 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                <button type="button" onClick={() => setEditing(shot)} aria-label="Mark up" className="cursor-pointer rounded-full bg-surface p-1.5 text-slate-700 hover:bg-slate-100">
                  <Pencil size={12} />
                </button>
                <button type="button" onClick={() => removeShot(shot.id)} aria-label="Remove" className="cursor-pointer rounded-full bg-surface p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10">
                  <X size={12} />
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
                className="flex h-16 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-surface text-[11px] font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
              >
                {capturing ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
                {capturing ? 'Capturing…' : 'This screen'}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-16 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-surface text-[11px] font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50"
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

      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60">
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className="flex w-full cursor-pointer items-center justify-between px-3.5 py-2.5 text-[12px] font-semibold text-slate-600"
        >
          Add more detail <span className="font-normal text-slate-400">(optional)</span>
          <ChevronDown size={14} className={`ml-auto transition ${moreOpen ? 'rotate-180' : ''}`} />
        </button>
        {moreOpen && (
          <div className="space-y-3 px-3.5 pb-3.5">
            <div>
              <label htmlFor="bug-title" className="mb-1 block text-[11.5px] font-semibold text-slate-600">
                Short title
              </label>
              <input
                id="bug-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={160}
                placeholder="We'll use your first line if you leave this empty"
                className="w-full rounded-xl border border-slate-200 bg-surface px-3 py-2 text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
              />
            </div>
            <div>
              <label htmlFor="bug-expected" className="mb-1 block text-[11.5px] font-semibold text-slate-600">
                What did you expect to happen?
              </label>
              <textarea
                id="bug-expected"
                value={expected}
                onChange={(e) => setExpected(e.target.value)}
                rows={2}
                maxLength={4000}
                className="w-full resize-none rounded-xl border border-slate-200 bg-surface px-3 py-2 text-[12.5px] text-slate-800 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
              />
            </div>
          </div>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-[12px] text-slate-600">
        <input
          type="checkbox"
          checked={includeDiagnostics}
          onChange={(e) => setIncludeDiagnostics(e.target.checked)}
          className="mt-0.5 h-3.5 w-3.5 cursor-pointer accent-ink"
        />
        <span>
          Include technical details
          <span className="group relative ml-1 inline-flex align-middle">
            <Info size={12} className="text-slate-400" />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-56 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-2 text-[11px] leading-snug text-on-ink opacity-0 shadow-lg transition group-hover:opacity-100">
              The page address, your browser and screen size, and recent error messages. Never passwords, form contents or
              cookies.
            </span>
          </span>
        </span>
      </label>

      <button
        type="submit"
        disabled={!canSend}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-bold text-on-ink shadow-sm transition hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
        {submitting ? 'Sending…' : 'Send report'}
      </button>

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
    </form>
  );
}
