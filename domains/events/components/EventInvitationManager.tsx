'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Mail, Users, X } from 'lucide-react';
import { ApiError } from '@/infrastructure/http/api';
import {
  useBulkInviteToEventMutation,
  useEventInvitationsQuery,
  useInviteToEventMutation,
  useRevokeInvitationMutation,
} from '../api/events.queries';
import type { BulkInviteResponse, EventInvitation } from '../types/events.types';

/**
 * Invite people to an event by email — one address, or a pasted list.
 *
 * The email links to `/events/invite`, which signs the person in (or up) with the invited address
 * and opens the event so they register the normal way — paying, if the event is paid. For a PRIVATE
 * event the invitation is also what lets them register at all (`InvitationRequirement`); for a
 * public one it is simply a personal invitation. The organiser chooses how long each link stays
 * usable; an expired or revoked address can simply be invited again.
 */
export interface EventInvitationManagerProps {
  eventId: string;
  className?: string;
}

/** Server limits (EventInvitationService / BulkInviteToEventRequest). */
const MAX_BULK = 100;
const VALIDITY_OPTIONS = [1, 3, 7, 14, 30] as const;
const DEFAULT_VALIDITY = 14;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Addresses from anything pasted — one per line, or separated by commas, semicolons or spaces. */
function parseEmails(text: string): { valid: string[]; invalid: string[] } {
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const token of text.split(/[\s,;]+/)) {
    // Tolerate "Name <person@example.com>" as copied from a mail client.
    const raw = token.replace(/^<|>$/g, '').trim();
    if (!raw) continue;
    const key = raw.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    (EMAIL.test(raw) ? valid : invalid).push(raw);
  }
  return { valid, invalid };
}

export function EventInvitationManager({ eventId, className }: EventInvitationManagerProps) {
  const [mode, setMode] = useState<'one' | 'many'>('one');
  const [email, setEmail] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [validityDays, setValidityDays] = useState<number>(DEFAULT_VALIDITY);
  const [error, setError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkInviteResponse | null>(null);

  const { data: invitations, isLoading } = useEventInvitationsQuery(eventId);
  const invite = useInviteToEventMutation(eventId);
  const inviteMany = useBulkInviteToEventMutation(eventId);
  const revoke = useRevokeInvitationMutation(eventId);

  const parsed = useMemo(() => parseEmails(bulkText), [bulkText]);
  const tooMany = parsed.valid.length > MAX_BULK;

  const submitOne = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setError(null);
    invite.mutate(
      { email: trimmed, validityDays },
      {
        onSuccess: () => setEmail(''),
        onError: (err) => setError(describeInviteFailure(err)),
      }
    );
  };

  const submitMany = (event: React.FormEvent) => {
    event.preventDefault();
    if (parsed.valid.length === 0 || tooMany) return;
    setError(null);
    setBulkResult(null);
    inviteMany.mutate(
      { emails: parsed.valid, validityDays },
      {
        onSuccess: (result) => {
          setBulkResult(result);
          // Keep only what did not go out, so the organiser can fix and resend it.
          const retry = result.results.filter((r) => r.outcome === 'FAILED').map((r) => r.email);
          setBulkText([...retry, ...parsed.invalid].join('\n'));
        },
        onError: (err) => setError(describeInviteFailure(err)),
      }
    );
  };

  const pending = invite.isPending || inviteMany.isPending;
  const tab = (id: 'one' | 'many', label: string, Icon: typeof Mail) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === id}
      onClick={() => {
        setMode(id);
        setError(null);
      }}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
        mode === id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );

  return (
    <div className={`rounded-xl border border-border bg-card p-6 ${className ?? ''}`}>
      <h3 className="mb-1 text-lg font-semibold">Invitations</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Invite people by email. They do not need an Arcade account yet — the link walks them
        through signing up.
      </p>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Invite" className="inline-flex gap-1 rounded-full border border-slate-200/80 bg-surface p-1">
          {tab('one', 'One person', Mail)}
          {tab('many', 'Many people', Users)}
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
          Link expires after
          <select
            value={validityDays}
            onChange={(e) => setValidityDays(Number(e.target.value))}
            className="cursor-pointer rounded-full border border-slate-200 bg-surface px-3 py-1.5 text-xs font-bold text-slate-800"
          >
            {VALIDITY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} {d === 1 ? 'day' : 'days'}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mode === 'one' ? (
        <form onSubmit={submitOne} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="person@example.com"
            aria-label="Email address to invite"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2"
          />
          <button
            type="submit"
            disabled={pending || !email.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
          >
            {invite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Invite
          </button>
        </form>
      ) : (
        <form onSubmit={submitMany} className="flex flex-col gap-2">
          <textarea
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
            rows={6}
            placeholder={'Paste addresses — one per line, or separated by commas\nasha@example.com\nrahul@example.com, meera@example.com'}
            aria-label="Email addresses to invite"
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={`text-xs ${tooMany ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
              {parsed.valid.length} address{parsed.valid.length === 1 ? '' : 'es'}
              {parsed.invalid.length > 0 && ` · ${parsed.invalid.length} not valid (skipped)`}
              {tooMany && ` · at most ${MAX_BULK} at a time`}
            </p>
            <button
              type="submit"
              disabled={pending || parsed.valid.length === 0 || tooMany}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
            >
              {inviteMany.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              {inviteMany.isPending
                ? `Sending ${parsed.valid.length}…`
                : parsed.valid.length
                  ? `Invite ${parsed.valid.length} ${parsed.valid.length === 1 ? 'person' : 'people'}`
                  : 'Invite'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {bulkResult && (
        <div className="mt-4 rounded-lg border border-border px-4 py-3 text-sm" role="status">
          <p className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {bulkResult.invited} invited
            {bulkResult.skipped > 0 && <span className="font-normal text-muted-foreground">· {bulkResult.skipped} not sent</span>}
          </p>
          {bulkResult.skipped > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {bulkResult.results
                .filter((r) => r.outcome !== 'INVITED')
                .map((r) => (
                  <li key={r.email}>
                    <span className="font-medium text-slate-700">{r.email}</span> — {OUTCOME_LABEL[r.outcome]}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading invitations…</p>
        ) : !invitations?.length ? (
          <p className="text-sm text-muted-foreground">Nobody has been invited yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {invitations.map((invitation) => (
              <li key={invitation.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{invitation.invitedEmail}</p>
                  <p className="text-xs text-muted-foreground">{describeInvitationState(invitation)}</p>
                </div>
                {invitation.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => revoke.mutate(invitation.id)}
                    disabled={revoke.isPending}
                    aria-label={`Revoke invitation to ${invitation.invitedEmail}`}
                    className="rounded p-1 text-muted-foreground hover:bg-muted"
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
  ALREADY_INVITED: 'already has a pending invitation',
  INVALID: 'not a valid email address',
  FAILED: "couldn't be sent — it is left in the box to try again",
};

function describeInvitationState(invitation: EventInvitation): string {
  switch (invitation.status) {
    case 'ACCEPTED':
      return invitation.acceptedAt ? `Accepted ${new Date(invitation.acceptedAt).toLocaleDateString()}` : 'Accepted';
    case 'PENDING':
      return `Invited — expires ${new Date(invitation.expiresAt).toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })}`;
    case 'REVOKED':
      return 'Revoked — invite again to resend';
    case 'EXPIRED':
      return 'Expired unclaimed — invite again to resend';
    default:
      return invitation.status;
  }
}

function describeInviteFailure(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError) return 'No connection — the invitation was not sent.';
    if (err.status === 403) return 'You do not have permission to invite people to this event.';
    // 409 is the "already has a pending invitation" case, which the server words well.
    if (err.status === 409 || err.status === 400) return err.message;
    return err.message;
  }
  return 'Could not send that invitation. Try again.';
}
