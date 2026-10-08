'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Console surface for Level 5 · Distinguished — the honour Arcade confers on a named person
 * (founders, core contributors, exceptional service). Confer one with a title, a citation and a
 * rating of 1–5 stars; see every honour conferred and revoke one with a reason.
 *
 * Rules:
 * - Gated on `platform.credentials.manage`. The gate here is a presentation hint; every endpoint
 *   it calls is enforced independently on the backend, which also validates and seals the honour.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Gem, Loader2, Star, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { CredentialBadge, credentialPath, credentialsApi, type IssuedBadge } from '@/domains/credentials';
import { cn } from '@/shared/utils/utils';

const EMPTY = { recipient: '', title: '', citation: '', stars: 5 };

function when(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function HonoursConsole() {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [honours, setHonours] = useState<IssuedBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setHonours(await credentialsApi.honours());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load honours.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch-on-mount: the request is the effect's whole purpose.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const confer = async () => {
    setSaving(true);
    try {
      const honour = await credentialsApi.conferHonour({
        recipient: form.recipient.trim(),
        title: form.title.trim(),
        citation: form.citation.trim(),
        stars: form.stars,
      });
      toast.success(`"${honour.name}" conferred on ${honour.recipientName}`);
      setForm(EMPTY);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not confer the honour.');
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (honour: IssuedBadge) => {
    const reason = window.prompt(
      `Revoke "${honour.name}" from ${honour.recipientName}?\n\nReason (required — shown on its public page):`,
    );
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error('A revocation needs a reason.');
      return;
    }
    try {
      await credentialsApi.revokeBadge(honour.credentialCode, reason.trim());
      toast.success('Honour revoked');
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not revoke that honour.');
    }
  };

  const ready = form.recipient.trim() && form.title.trim() && form.citation.trim();
  const input =
    'w-full rounded-xl border border-slate-200 bg-surface px-3.5 py-2.5 text-[13px] font-semibold text-slate-900 outline-none focus:border-slate-900';

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-3xl border border-slate-200/80 bg-surface p-6 shadow-xs lg:grid-cols-[1fr_240px]">
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900">Confer a Distinguished honour</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Level 5 is never earned through a course, event or exam. Arcade confers it on a person — a founder, a core
              contributor, exceptional service — and seals the title, citation and stars into the badge.
            </p>
          </div>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Person</span>
            <input
              value={form.recipient}
              onChange={(e) => setForm({ ...form, recipient: e.target.value })}
              placeholder="@handle or account email"
              className={input}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Title (printed on the badge)</span>
            <input
              value={form.title}
              maxLength={80}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Founding Member, Core Contributor"
              className={input}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Citation (on its credential page)</span>
            <textarea
              value={form.citation}
              maxLength={1000}
              rows={3}
              onChange={(e) => setForm({ ...form, citation: e.target.value })}
              placeholder="What it is conferred for, in a sentence or two."
              className={cn(input, 'resize-y')}
            />
          </label>
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Rating</span>
            <div role="radiogroup" aria-label="Stars" className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={form.stars === n}
                  aria-label={`${n} star${n === 1 ? '' : 's'}`}
                  onClick={() => setForm({ ...form, stars: n })}
                  className="rounded-lg p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={22}
                    className={n <= form.stars ? 'fill-[#E2B84A] text-[#B8892A]' : 'text-slate-300'}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-slate-500">{form.stars} of 5</span>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={confer}
              disabled={!ready || saving}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-xs font-extrabold text-on-ink shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Gem size={13} />} Confer honour
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-surface p-4">
          <CredentialBadge
            family="HONOUR"
            level={5}
            title={form.title.trim() || 'Founding Member'}
            year={new Date().getFullYear()}
            stars={form.stars}
            className="w-48"
          />
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Preview</p>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-extrabold tracking-tight text-slate-900">Honours conferred</h3>
        {loading ? (
          <div className="flex items-center gap-2 py-10 text-[13px] font-bold text-slate-400">
            <Loader2 size={15} className="animate-spin" /> Loading…
          </div>
        ) : honours.length === 0 ? (
          <p className="py-10 text-center text-[13px] font-medium text-slate-500">No honours conferred yet.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {honours.map((h) => (
              <li
                key={h.credentialCode}
                className={cn(
                  'flex gap-4 rounded-2xl border border-slate-200/80 bg-surface p-4 shadow-xs',
                  h.revoked && 'opacity-70',
                )}
              >
                <CredentialBadge
                  family="HONOUR"
                  level={5}
                  title={h.name}
                  year={new Date(h.issuedAt).getFullYear()}
                  stars={h.stars}
                  revoked={h.revoked}
                  className="w-24 shrink-0"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="truncate text-sm font-extrabold text-slate-900">{h.name}</p>
                  <p className="text-xs font-medium text-slate-500">
                    {h.recipientName}
                    {h.recipientHandle ? ` · @${h.recipientHandle}` : ''} · {when(h.issuedAt)} · {h.stars} of 5
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-600">{h.citation}</p>
                  {h.revoked && (
                    <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">Revoked — {h.revokedReason}</p>
                  )}
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <Link
                      href={credentialPath(h.credentialCode)}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:border-slate-900"
                    >
                      <ExternalLink size={11} /> Open
                    </Link>
                    {!h.revoked && (
                      <button
                        type="button"
                        onClick={() => revoke(h)}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-50 dark:border-rose-400/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
                      >
                        <Undo2 size={11} /> Revoke
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
