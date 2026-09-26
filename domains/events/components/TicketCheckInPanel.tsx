'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { ApiError } from '@/infrastructure/http/api';
import { useCheckInMutation } from '../api/events.queries';
import type { CheckInResponse } from '../types/events.types';

/**
 * The door. An organiser types or scans a ticket and is told who it is.
 *
 * Two deliberate behaviours:
 *
 * 1. An already-admitted ticket is shown as a *success*, not an error. A second scan at the same
 *    door is how a queue behaves, and the useful answer is "yes, this is the right person, they
 *    came through at 18:42" — an error banner makes staff wave people past unchecked.
 * 2. The scanned payload is submitted and then cleared. It is a bearer credential; leaving it in
 *    an input where the next person can read it off the screen defeats the point of signing it.
 */
export interface TicketCheckInPanelProps {
  eventId: string;
  /** Optional: admit to one session of a multi-session event rather than the event as a whole. */
  sessionId?: string;
  className?: string;
}

export function TicketCheckInPanel({
  eventId,
  sessionId,
  className,
}: TicketCheckInPanelProps) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<CheckInResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const checkIn = useCheckInMutation(eventId);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setResult(null);
    setError(null);

    // A scanner types the whole signed payload into the same box a person types a short code
    // into, so the shape decides which field it goes in. The payload is versioned and
    // dot-delimited; a short code never is.
    const isScannedPayload = trimmed.startsWith('v1.');

    checkIn.mutate(
      {
        qrPayload: isScannedPayload ? trimmed : undefined,
        code: isScannedPayload ? undefined : trimmed,
        sessionId,
      },
      {
        onSuccess: (response) => {
          setResult(response);
          setCode('');
        },
        onError: (err) => {
          setError(describeCheckInFailure(err));
          setCode('');
        },
      }
    );
  };

  return (
    <div className={`rounded-xl border border-border bg-card p-6 ${className ?? ''}`}>
      <h3 className="mb-1 text-lg font-semibold">Check in</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Scan a ticket, or type the code printed on it.
      </p>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="ARC-7F3K-92QD"
          aria-label="Ticket code or scanned ticket"
          autoComplete="off"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono"
        />
        <button
          type="submit"
          disabled={checkIn.isPending || !code.trim()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          {checkIn.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Admit
        </button>
      </form>

      {result && (
        <div
          className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">
              {result.alreadyAdmitted ? 'Already checked in' : 'Admitted'}
            </p>
            <p className="text-sm">
              {result.holderName ?? result.holderEmail ?? result.code}
            </p>
            <p className="text-xs opacity-80">
              {result.alreadyAdmitted ? 'Came through at ' : 'Admitted at '}
              {new Date(result.checkedInAt).toLocaleTimeString()} · {result.method}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div
          className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900"
          role="alert"
        >
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Turns a refusal into something the person on the door can act on.
 *
 * The server reports an unverifiable ticket and an unknown one identically, on purpose, so this
 * cannot distinguish them either — and should not try.
 */
function describeCheckInFailure(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError) return 'No connection — the ticket could not be checked.';
    if (err.status === 401) return 'Your session expired. Sign in again to keep checking people in.';
    if (err.status === 403) return 'You do not have permission to check people in for this event.';
    if (err.status === 404) return 'No ticket matches that code.';
    if (err.status === 409) return err.message;
    return err.message;
  }
  return 'Could not check that ticket. Try again.';
}
