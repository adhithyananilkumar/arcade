'use client';

import React, { useState } from 'react';
import { Loader2, Mail, X } from 'lucide-react';
import { ApiError } from '@/infrastructure/http/api';
import {
  useEventInvitationsQuery,
  useInviteToEventMutation,
  useRevokeInvitationMutation,
} from '../api/events.queries';
import type { EventInvitation } from '../types/events.types';

/**
 * Who may register for a private event.
 *
 * Only meaningful for an event whose visibility is PRIVATE — a public event ignores invitations
 * entirely, because `InvitationRequirement` only runs for private ones. The caller decides whether
 * to render this at all rather than having it guess from a field it would have to fetch.
 */
export interface EventInvitationManagerProps {
  eventId: string;
  className?: string;
}

export function EventInvitationManager({ eventId, className }: EventInvitationManagerProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: invitations, isLoading } = useEventInvitationsQuery(eventId);
  const invite = useInviteToEventMutation(eventId);
  const revoke = useRevokeInvitationMutation(eventId);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setError(null);
    invite.mutate(trimmed, {
      onSuccess: () => setEmail(''),
      onError: (err) => setError(describeInviteFailure(err)),
    });
  };

  return (
    <div className={`rounded-xl border border-border bg-card p-6 ${className ?? ''}`}>
      <h3 className="mb-1 text-lg font-semibold">Invitations</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Invite people by email. They do not need an Arcade account yet — the link walks them
        through signing up.
      </p>

      <form onSubmit={submit} className="flex gap-2">
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
          disabled={invite.isPending || !email.trim()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          {invite.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Invite
        </button>
      </form>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
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
                  <p className="text-xs text-muted-foreground">
                    {describeInvitationState(invitation)}
                  </p>
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

function describeInvitationState(invitation: EventInvitation): string {
  switch (invitation.status) {
    case 'ACCEPTED':
      return invitation.acceptedAt
        ? `Accepted ${new Date(invitation.acceptedAt).toLocaleDateString()}`
        : 'Accepted';
    case 'PENDING':
      return `Invited — expires ${new Date(invitation.expiresAt).toLocaleDateString()}`;
    case 'REVOKED':
      return 'Revoked';
    case 'EXPIRED':
      return 'Expired unclaimed';
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
