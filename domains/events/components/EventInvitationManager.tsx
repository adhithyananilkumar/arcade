'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  UploadCloud,
  Users,
  X,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/infrastructure/http/api';
import {
  useBulkInviteToEventMutation,
  useEventInvitationsQuery,
  useInviteToEventMutation,
  useRevokeInvitationMutation,
} from '../api/events.queries';
import type { BulkInviteResponse, EventInvitation } from '../types/events.types';
import {
  downloadCsvTemplate,
  downloadJsonTemplate,
  parseInviteFile,
  type ParsedInviteFile,
} from '../lib/inviteFileParser';

export interface EventInvitationManagerProps {
  eventId: string;
  isPrivate?: boolean;
  initialMode?: 'one' | 'many' | 'file';
  className?: string;
}

/** Server limits (EventInvitationService / BulkInviteToEventRequest). */
const MAX_BULK = 100;
const VALIDITY_OPTIONS = [1, 3, 7, 14, 30] as const;
const DEFAULT_VALIDITY = 14;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Addresses from anything pasted — one per line, or separated by commas, semicolons or spaces. */
function parseEmails(text: string): { valid: string[]; invalid: string[] } {
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const token of text.split(/[\s,;]+/)) {
    const raw = token.replace(/^[<"']|[>"']$/g, '').trim();
    if (!raw) continue;
    const key = raw.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    (EMAIL_REGEX.test(raw) ? valid : invalid).push(raw);
  }
  return { valid, invalid };
}

export function EventInvitationManager({
  eventId,
  isPrivate = false,
  initialMode = 'one',
  className,
}: EventInvitationManagerProps) {
  const [mode, setMode] = useState<'one' | 'many' | 'file'>(initialMode);
  const [email, setEmail] = useState('');
  const [bulkText, setBulkText] = useState('');
  // For private events, validity is strictly 1 day (24 hours)
  const [validityDays, setValidityDays] = useState<number>(isPrivate ? 1 : DEFAULT_VALIDITY);
  const [error, setError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkInviteResponse | null>(null);

  // File upload state
  const [parsedFile, setParsedFile] = useState<ParsedInviteFile | null>(null);
  const [fileParsing, setFileParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showInvalidDetails, setShowInvalidDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: invitations, isLoading } = useEventInvitationsQuery(eventId);
  const invite = useInviteToEventMutation(eventId);
  const inviteMany = useBulkInviteToEventMutation(eventId);
  const revoke = useRevokeInvitationMutation(eventId);

  const effectiveValidityDays = isPrivate ? 1 : validityDays;

  const parsed = useMemo(() => parseEmails(bulkText), [bulkText]);
  const tooManyPasted = parsed.valid.length > MAX_BULK;

  // Single invite submit
  const submitOne = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setError(null);
    invite.mutate(
      { email: trimmed, validityDays: effectiveValidityDays },
      {
        onSuccess: () => {
          setEmail('');
          toast.success(`Invitation sent to ${trimmed}`);
        },
        onError: (err) => setError(describeInviteFailure(err)),
      }
    );
  };

  // Textarea bulk invite submit
  const submitMany = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsed.valid.length === 0 || tooManyPasted) return;
    setError(null);
    setBulkResult(null);
    inviteMany.mutate(
      { emails: parsed.valid, validityDays: effectiveValidityDays },
      {
        onSuccess: (result) => {
          setBulkResult(result);
          toast.success(`${result.invited} invitation${result.invited === 1 ? '' : 's'} sent`);
          const retry = result.results.filter((r) => r.outcome === 'FAILED').map((r) => r.email);
          setBulkText([...retry, ...parsed.invalid].join('\n'));
        },
        onError: (err) => setError(describeInviteFailure(err)),
      }
    );
  };

  // File handling
  const handleFile = async (file: File) => {
    setError(null);
    setBulkResult(null);
    setFileParsing(true);
    try {
      const res = await parseInviteFile(file);
      setParsedFile(res);
      toast.success(`Loaded ${res.validEmails.length} valid address${res.validEmails.length === 1 ? '' : 'es'} from ${file.name}`);
    } catch (err) {
      setParsedFile(null);
      const msg = err instanceof Error ? err.message : 'Failed to parse file';
      setError(msg);
      toast.error(msg);
    } finally {
      setFileParsing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const clearFile = () => {
    setParsedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit file invitations
  const submitFileInvites = () => {
    if (!parsedFile || parsedFile.validEmails.length === 0) return;
    setError(null);
    setBulkResult(null);
    inviteMany.mutate(
      { emails: parsedFile.validEmails, validityDays: effectiveValidityDays },
      {
        onSuccess: (result) => {
          setBulkResult(result);
          toast.success(`${result.invited} of ${parsedFile.validEmails.length} invitations sent`);
        },
        onError: (err) => setError(describeInviteFailure(err)),
      }
    );
  };

  const copyFailedAddresses = () => {
    if (!bulkResult) return;
    const failed = bulkResult.results
      .filter((r) => r.outcome !== 'INVITED')
      .map((r) => `${r.email} (${r.outcome})`)
      .join('\n');
    navigator.clipboard.writeText(failed);
    toast.success('Copied skipped/failed addresses to clipboard');
  };

  const pending = invite.isPending || inviteMany.isPending || fileParsing;

  const tab = (id: 'one' | 'many' | 'file', label: string, Icon: React.ComponentType<{ className?: string }>) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === id}
      onClick={() => {
        setMode(id);
        setError(null);
      }}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-150 ${
        mode === id
          ? 'bg-blue-600 text-white shadow-xs'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );

  return (
    <div className={`rounded-2xl border border-slate-200/90 bg-surface p-6 shadow-xs dark:border-slate-800 ${className ?? ''}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-extrabold text-ink">Event Invitations</h3>
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          Invite attendees directly via email, pasted lists, or bulk CSV/JSON files. Recipients will receive a secure admission link.
        </p>
      </div>

      {/* Private Event Security Notice */}
      {isPrivate && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-200/80 bg-blue-50/70 p-3 text-xs text-blue-950 dark:border-blue-500/25 dark:bg-blue-950/30 dark:text-blue-200">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="flex-1">
            <span className="font-extrabold">Private Event Protection:</span>{' '}
            <span className="font-medium text-blue-800 dark:text-blue-300">
              Invitations expire in <strong>24 hours</strong>. Each link is <strong>single-use</strong> (only 1 participant can register per link, locked to the invited email).
            </span>
          </div>
        </div>
      )}

      {/* Control Bar: Mode Tabs + Validity Setting */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800/80">
        <div role="tablist" aria-label="Invite Mode" className="inline-flex gap-1 rounded-full border border-slate-200/80 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
          {tab('one', 'One person', Mail)}
          {tab('many', 'Paste list', Users)}
          {tab('file', 'Import CSV / JSON', FileSpreadsheet)}
        </div>

        {/* Validity Display / Selector */}
        {isPrivate ? (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-100/80 px-3 py-1.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Valid for 24 hours</span>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">(Private)</span>
          </div>
        ) : (
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            Link expires after
            <select
              value={validityDays}
              onChange={(e) => setValidityDays(Number(e.target.value))}
              className="cursor-pointer rounded-full border border-slate-200 bg-surface px-3 py-1.5 text-xs font-bold text-ink dark:border-slate-700"
            >
              {VALIDITY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? 'day (24 hours)' : 'days'}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* ── Mode 1: One Person ────────────────────────────────────────── */}
      {mode === 'one' && (
        <form onSubmit={submitOne} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
            aria-label="Email address to invite"
            className="flex-1 rounded-full border border-slate-200/90 bg-surface px-4 py-2.5 text-xs text-ink outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800"
          />
          <button
            type="submit"
            disabled={pending || !email.trim()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-extrabold text-on-ink shadow-sm transition hover:bg-[#205ca8] disabled:opacity-50"
          >
            {invite.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
            Invite
          </button>
        </form>
      )}

      {/* ── Mode 2: Paste List ────────────────────────────────────────── */}
      {mode === 'many' && (
        <form onSubmit={submitMany} className="flex flex-col gap-3">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={5}
            placeholder={'Paste email addresses — one per line, or separated by commas:\nalex@example.com\nmaria@example.com, sam@example.com'}
            aria-label="Email addresses to invite"
            className="w-full resize-y rounded-2xl border border-slate-200/90 bg-surface p-3.5 font-mono text-xs text-ink outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={`text-xs ${tooManyPasted ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>
              <strong className="font-bold text-slate-800 dark:text-slate-200">{parsed.valid.length}</strong> valid address{parsed.valid.length === 1 ? '' : 'es'}
              {parsed.invalid.length > 0 && ` · ${parsed.invalid.length} invalid skipped`}
              {tooManyPasted && ` · Maximum ${MAX_BULK} per batch`}
            </p>
            <button
              type="submit"
              disabled={pending || parsed.valid.length === 0 || tooManyPasted}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-extrabold text-on-ink shadow-sm transition hover:bg-[#205ca8] disabled:opacity-50"
            >
              {inviteMany.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Users className="h-3.5 w-3.5" />}
              {inviteMany.isPending
                ? `Sending ${parsed.valid.length}…`
                : parsed.valid.length > 0
                  ? `Invite ${parsed.valid.length} ${parsed.valid.length === 1 ? 'person' : 'people'}`
                  : 'Invite'}
            </button>
          </div>
        </form>
      )}

      {/* ── Mode 3: Import CSV / JSON ─────────────────────────────────── */}
      {mode === 'file' && (
        <div className="flex flex-col gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .json, text/csv, application/json"
            onChange={onFileInputChange}
            className="hidden"
          />

          {!parsedFile ? (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/20'
                  : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/70 dark:border-slate-700 dark:hover:bg-slate-900/40'
              }`}
            >
              <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                {fileParsing ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
              </div>
              <h4 className="text-sm font-bold text-ink">
                {fileParsing ? 'Parsing invitation file…' : 'Upload CSV or JSON file'}
              </h4>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                Drag and drop your file here, or click to browse. Automatically extracts and validates emails.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  .CSV
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  .JSON
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              {/* File Info Bar */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="grid size-9 place-items-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-extrabold text-ink">{parsedFile.filename}</p>
                    <p className="text-[11px] text-slate-400">
                      {(parsedFile.fileSizeBytes / 1024).toFixed(1)} KB · {parsedFile.format.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-surface px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </button>
              </div>

              {/* Stats Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {parsedFile.validEmails.length} valid addresses
                </span>
                {parsedFile.duplicatesCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    {parsedFile.duplicatesCount} duplicate{parsedFile.duplicatesCount === 1 ? '' : 's'} removed
                  </span>
                )}
                {parsedFile.invalidEntries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowInvalidDetails((v) => !v)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {parsedFile.invalidEntries.length} invalid {showInvalidDetails ? '▲' : '▼'}
                  </button>
                )}
              </div>

              {/* Invalid Details Accordion */}
              {showInvalidDetails && parsedFile.invalidEntries.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-950/20 dark:text-red-300">
                  <p className="font-bold mb-1">Skipped invalid entries:</p>
                  <div className="max-h-24 overflow-y-auto font-mono text-[11px] space-y-0.5">
                    {parsedFile.invalidEntries.map((inv, idx) => (
                      <div key={idx} className="truncate">• {inv}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview of first addresses */}
              {parsedFile.validEmails.length > 0 && (
                <div className="rounded-xl border border-slate-200/80 bg-surface p-3 dark:border-slate-800">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Preview of recipients ({Math.min(6, parsedFile.validEmails.length)} of {parsedFile.validEmails.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedFile.validEmails.slice(0, 6).map((addr) => (
                      <span
                        key={addr}
                        className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {addr}
                      </span>
                    ))}
                    {parsedFile.validEmails.length > 6 && (
                      <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                        +{parsedFile.validEmails.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={submitFileInvites}
                disabled={inviteMany.isPending || parsedFile.validEmails.length === 0}
                className="mt-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {inviteMany.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
                {inviteMany.isPending
                  ? `Sending ${parsedFile.validEmails.length} invitations…`
                  : `Send ${parsedFile.validEmails.length} invitations`}
              </button>
            </div>
          )}

          {/* Sample Templates Download Links */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1 text-[11px]">
              <HelpCircle className="h-3.5 w-3.5" /> Need a formatted template?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadCsvTemplate}
                className="inline-flex cursor-pointer items-center gap-1 font-bold text-blue-600 hover:underline dark:text-blue-400"
              >
                <Download className="h-3 w-3" /> Sample CSV
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={downloadJsonTemplate}
                className="inline-flex cursor-pointer items-center gap-1 font-bold text-blue-600 hover:underline dark:text-blue-400"
              >
                <Download className="h-3 w-3" /> Sample JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400" role="alert">
          {error}
        </div>
      )}

      {/* Bulk Result Report */}
      {bulkResult && (
        <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50" role="status">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs font-extrabold text-ink">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {bulkResult.invited} invitation{bulkResult.invited === 1 ? '' : 's'} dispatched
              {bulkResult.skipped > 0 && (
                <span className="font-semibold text-slate-500">· {bulkResult.skipped} not sent</span>
              )}
            </p>
            {bulkResult.skipped > 0 && (
              <button
                type="button"
                onClick={copyFailedAddresses}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-surface px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Copy className="h-3 w-3" /> Copy skipped
              </button>
            )}
          </div>
          {bulkResult.skipped > 0 && (
            <ul className="mt-2.5 max-h-32 overflow-y-auto space-y-1 text-xs text-slate-600 dark:text-slate-400">
              {bulkResult.results
                .filter((r) => r.outcome !== 'INVITED')
                .map((r) => (
                  <li key={r.email} className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-800 dark:text-slate-200">{r.email}</span>
                    <span className="text-slate-500">{OUTCOME_LABEL[r.outcome] ?? r.outcome}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      {/* Existing Invitations List */}
      <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
          Pending & Past Invitations
        </h4>
        {isLoading ? (
          <p className="text-xs text-slate-400">Loading invitations…</p>
        ) : !invitations?.length ? (
          <p className="text-xs text-slate-400">No invitations issued yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-60 overflow-y-auto pr-1">
            {invitations.map((invitation) => (
              <li key={invitation.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-xs font-bold text-ink">{invitation.invitedEmail}</p>
                  <p className="text-[11px] text-slate-400">{describeInvitationState(invitation)}</p>
                </div>
                {invitation.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => revoke.mutate(invitation.id)}
                    disabled={revoke.isPending}
                    aria-label={`Revoke invitation to ${invitation.invitedEmail}`}
                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition-colors dark:hover:bg-slate-800"
                    title="Revoke invitation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const OUTCOME_LABEL: Record<string, string> = {
  ALREADY_INVITED: 'Already has a pending invitation',
  INVALID: 'Invalid email address',
  FAILED: 'Sending failed — please retry',
};

function describeInvitationState(invitation: EventInvitation): string {
  switch (invitation.status) {
    case 'ACCEPTED':
      return invitation.acceptedAt ? `Accepted on ${new Date(invitation.acceptedAt).toLocaleDateString()}` : 'Accepted';
    case 'PENDING':
      return `Invited · expires ${new Date(invitation.expiresAt).toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })}`;
    case 'REVOKED':
      return 'Revoked offer';
    case 'EXPIRED':
      return 'Expired unclaimed';
    default:
      return invitation.status;
  }
}

function describeInviteFailure(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError) return 'Network failure — could not send invitations.';
    if (err.status === 403) return 'You do not have permission to invite people to this event.';
    if (err.status === 409 || err.status === 400) return err.message;
    return err.message;
  }
  return 'Could not process invitation request. Please try again.';
}
