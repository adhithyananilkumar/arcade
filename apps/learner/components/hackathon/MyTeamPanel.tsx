'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Check,
  Copy,
  Crown,
  KeyRound,
  LogOut,
  Mail,
  MessageCircle,
  Pencil,
  RefreshCw,
  Send,
  Share2,
  UserMinus,
  UserPlus,
  X,
} from 'lucide-react';
import {
  CompetitionChip,
  PersonAvatar,
  TeamBoardService,
  type InviteResults,
  type TeamBoard,
  type TeamJoinRequest,
  type TeamRequest,
} from '@/domains/events';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import {
  dangerButton,
  errorText,
  inputClass,
  panelClass,
  primaryButton,
  secondaryButton,
  splitIdentifiers,
} from './hackathonUtils';

interface Props {
  eventId: string;
  eventSlug: string;
  board: TeamBoard;
  onBoard: (board: TeamBoard) => void;
  onRefresh: () => void;
  onFindTeam: () => void;
}

export function MyTeamPanel(props: Props) {
  return props.board.team ? <TeamView {...props} /> : <NoTeamView {...props} />;
}

// ─────────────────────────────── without a team ───────────────────────────────

function NoTeamView({ eventId, board, onBoard, onFindTeam }: Props) {
  const s = board.competition.settings;
  const canAct = board.registered && !board.judge && s.teamsOpen;
  const [busy, setBusy] = useState<string | null>(null);
  const [code, setCode] = useState('');

  const run = async (key: string, fn: () => Promise<TeamBoard>, ok?: string) => {
    setBusy(key);
    try {
      onBoard(await fn());
      if (ok) toast.success(ok);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="flex flex-col gap-5 lg:col-span-3">
        {board.invites.length > 0 && (
          <section className={`${panelClass} border-amber-200 dark:border-amber-500/30`}>
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <Mail size={16} className="text-amber-500" /> You’ve been invited
            </h2>
            <ul className="mt-4 flex flex-col divide-y divide-slate-100">
              {board.invites.map((inv) => (
                <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <PersonAvatar person={inv.invitedBy} size={36} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">
                        {inv.teamName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {inv.invitedBy?.name ?? 'A teammate'} invited you{inv.message ? ` — “${inv.message}”` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={primaryButton}
                      disabled={!canAct || busy !== null}
                      onClick={() => run(inv.id, () => TeamBoardService.decide(eventId, inv.id, 'accept'), `You joined ${inv.teamName}`)}
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button
                      type="button"
                      className={secondaryButton}
                      disabled={busy !== null}
                      onClick={() => run(inv.id + 'd', () => TeamBoardService.decide(eventId, inv.id, 'decline'))}
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {!board.registered && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Register for the event to accept.</p>}
          </section>
        )}

        <section className={panelClass}>
          <h2 className="text-lg font-black tracking-tight text-slate-900">Start a team</h2>
          <p className="mt-1 text-sm text-slate-500">You’ll be captain. Invite friends right after — by username, email, or a link.</p>
          <TeamForm
            className="mt-5"
            tracks={board.competition.tracks}
            disabled={!canAct}
            submitLabel="Create team"
            onSubmit={(body) => run('create', () => TeamBoardService.createTeam(eventId, body), `Team ${body.name} created`)}
            busy={busy === 'create'}
          />
          {!s.teamsOpen && <p className="mt-3 text-xs font-semibold text-rose-600">Team formation has closed.</p>}
        </section>
      </div>

      <div className="flex flex-col gap-5 lg:col-span-2">
        <section className={panelClass}>
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <KeyRound size={16} /> Got a team code?
          </h2>
          <p className="mt-1 text-xs text-slate-500">Paste the 8-character code from your teammate’s invite link.</p>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) run('code', () => TeamBoardService.joinByCode(eventId, code.trim()), 'Joined the team');
            }}
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={12}
              placeholder="ABCD2345"
              className={`${inputClass} font-mono tracking-[0.2em]`}
              disabled={!canAct}
            />
            <button type="submit" className={primaryButton} disabled={!canAct || !code.trim() || busy !== null}>
              Join
            </button>
          </form>
        </section>

        <section className={panelClass}>
          <h2 className="text-sm font-extrabold text-slate-900">Looking for teammates?</h2>
          <p className="mt-1 text-xs text-slate-500">Browse teams that are recruiting and ask to join one.</p>
          <button type="button" className={`${secondaryButton} mt-4`} onClick={onFindTeam} disabled={!s.teamsOpen}>
            <UserPlus size={14} /> Find a team
          </button>
          {board.myRequests.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {board.myRequests.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs">
                  <span>
                    Asked to join <strong className="text-slate-900">{r.teamName}</strong>
                  </span>
                  <button type="button" className="cursor-pointer font-bold text-slate-500 hover:text-rose-600" onClick={() => run(r.id, () => TeamBoardService.decide(eventId, r.id, 'cancel'))}>
                    Withdraw
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────── with a team ───────────────────────────────

function TeamView({ eventId, eventSlug, board, onBoard }: Props) {
  const me = useAuthStore((s) => s.user?.id);
  const team = board.team!;
  const s = board.competition.settings;
  const isCaptain = team.captainUserId === me;
  const open = s.teamsOpen && team.status === 'ACTIVE';
  const full = team.members.length >= s.maxTeamSize;
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const run = async (key: string, fn: () => Promise<TeamBoard>, ok?: string) => {
    setBusy(key);
    try {
      onBoard(await fn());
      if (ok) toast.success(ok);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(null);
    }
  };

  const requests = (team.pendingRequests ?? []).filter((r) => r.kind === 'REQUEST');
  const invites = (team.pendingRequests ?? []).filter((r) => r.kind === 'INVITE');

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="flex flex-col gap-5 lg:col-span-3">
        {team.status === 'DISQUALIFIED' && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            <strong>Your team was disqualified.</strong> {team.statusReason ?? 'Contact the organiser for details.'}
          </div>
        )}

        <section className={panelClass}>
          {editing ? (
            <>
              <h2 className="text-sm font-extrabold text-slate-900">Edit team</h2>
              <TeamForm
                className="mt-4"
                tracks={board.competition.tracks}
                initial={{ name: team.name, tagline: team.tagline, trackId: team.trackId, lookingForMembers: team.lookingForMembers, skillsWanted: team.skillsWanted }}
                submitLabel="Save team"
                busy={busy === 'edit'}
                onCancel={() => setEditing(false)}
                onSubmit={async (body) => {
                  await run('edit', () => TeamBoardService.updateTeam(eventId, body), 'Team updated');
                  setEditing(false);
                }}
              />
            </>
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-black text-white shadow-lg">
                  {team.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-black tracking-tight text-slate-900">{team.name}</h2>
                  {team.tagline && <p className="text-sm text-slate-500">{team.tagline}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {team.trackName && <CompetitionChip tone="violet">{team.trackName}</CompetitionChip>}
                    <CompetitionChip tone={team.submissionStatus === 'SUBMITTED' ? 'green' : team.submissionStatus === 'DRAFT' ? 'amber' : 'neutral'}>
                      {team.submissionStatus === 'SUBMITTED' ? 'Project submitted' : team.submissionStatus === 'DRAFT' ? 'Project draft' : 'No project yet'}
                    </CompetitionChip>
                    {team.lookingForMembers && <CompetitionChip tone="green">Recruiting</CompetitionChip>}
                  </div>
                </div>
              </div>
              {isCaptain && open && (
                <button type="button" className={secondaryButton} onClick={() => setEditing(true)}>
                  <Pencil size={13} /> Edit
                </button>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Members · {team.members.length}/{s.maxTeamSize}
            </h3>
            {team.members.length < s.minTeamSize && (
              <span className="text-[11px] font-bold text-amber-600">Need {s.minTeamSize - team.members.length} more to submit</span>
            )}
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {team.members.map((m) => (
              <li key={m.person.userId} className="group flex items-center gap-3 rounded-2xl border border-slate-100 p-3">
                <PersonAvatar person={m.person} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-bold text-slate-900">
                    {m.person.name ?? 'Member'}
                    {m.captain && <Crown size={13} className="text-amber-500" aria-label="Captain" />}
                    {m.person.userId === me && <span className="text-[10px] font-semibold text-slate-400">you</span>}
                  </p>
                  {m.person.username && <p className="truncate text-xs text-slate-500">@{m.person.username}</p>}
                </div>
                {isCaptain && open && m.person.userId !== me && (
                  <div className="flex gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                    <IconButton label="Make captain" onClick={() => run('cap' + m.person.userId, () => TeamBoardService.makeCaptain(eventId, m.person.userId), `${m.person.name} is now captain`)}>
                      <Crown size={14} />
                    </IconButton>
                    <IconButton
                      label="Remove from team"
                      danger
                      onClick={() => {
                        if (confirm(`Remove ${m.person.name ?? 'this member'} from the team?`)) run('rm' + m.person.userId, () => TeamBoardService.removeMember(eventId, m.person.userId));
                      }}
                    >
                      <UserMinus size={14} />
                    </IconButton>
                  </div>
                )}
              </li>
            ))}
            {Array.from({ length: Math.max(0, s.maxTeamSize - team.members.length) }).slice(0, 4).map((_, i) => (
              <li key={`slot-${i}`} className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 p-3 text-xs font-semibold text-slate-400">
                <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-slate-300">
                  <UserPlus size={15} />
                </span>
                Open seat
              </li>
            ))}
          </ul>
        </section>

        {requests.length > 0 && (
          <section className={panelClass}>
            <h2 className="text-sm font-extrabold text-slate-900">Asking to join</h2>
            <ul className="mt-3 flex flex-col divide-y divide-slate-100">
              {requests.map((r) => (
                <RequestRow
                  key={r.id}
                  request={r}
                  actions={
                    isCaptain ? (
                      <>
                        <button type="button" className={primaryButton} disabled={busy !== null || full} onClick={() => run(r.id, () => TeamBoardService.decide(eventId, r.id, 'accept'), `${r.person?.name} joined`)}>
                          <Check size={14} /> Accept
                        </button>
                        <button type="button" className={secondaryButton} disabled={busy !== null} onClick={() => run(r.id + 'x', () => TeamBoardService.decide(eventId, r.id, 'decline'))}>
                          Decline
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400">Captain decides</span>
                    )
                  }
                />
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="flex flex-col gap-5 lg:col-span-2">
        {open && !full && (
          <InviteFriendsPanel
            eventId={eventId}
            eventSlug={eventSlug}
            joinCode={team.joinCode}
            teamName={team.name}
            isCaptain={isCaptain}
            onRotate={() => run('rotate', () => TeamBoardService.rotateCode(eventId), 'New invite link created — the old one no longer works')}
            onSent={() => onBoard({ ...board })}
            onRefresh={async () => onBoard(await TeamBoardService.board(eventId))}
          />
        )}
        {full && open && (
          <section className={`${panelClass} text-center`}>
            <p className="text-sm font-extrabold text-slate-900">Your team is full 🎉</p>
            <p className="mt-1 text-xs text-slate-500">Head to the Project tab and start building.</p>
          </section>
        )}

        {invites.length > 0 && (
          <section className={panelClass}>
            <h2 className="text-sm font-extrabold text-slate-900">Invites waiting</h2>
            <ul className="mt-3 flex flex-col divide-y divide-slate-100">
              {invites.map((r) => (
                <RequestRow
                  key={r.id}
                  request={r}
                  actions={
                    open && (
                      <button type="button" className="cursor-pointer text-[11px] font-bold text-slate-400 hover:text-rose-600" onClick={() => run(r.id, () => TeamBoardService.decide(eventId, r.id, 'cancel'))}>
                        Cancel
                      </button>
                    )
                  }
                />
              ))}
            </ul>
          </section>
        )}

        {open && (
          <button
            type="button"
            className={`${dangerButton} self-start`}
            disabled={busy !== null}
            onClick={() => {
              const last = team.members.length === 1;
              if (confirm(last ? 'You are the last member — leaving deletes the team and its project draft. Leave?' : 'Leave this team?')) {
                run('leave', () => TeamBoardService.leave(eventId), 'You left the team');
              }
            }}
          >
            <LogOut size={14} /> Leave team
          </button>
        )}
        {!s.teamsOpen && <p className="text-xs text-slate-400">Teams are locked — membership can no longer change.</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────── invite friends ───────────────────────────────

function InviteFriendsPanel({
  eventId,
  joinCode,
  teamName,
  isCaptain,
  onRotate,
  onRefresh,
}: {
  eventId: string;
  eventSlug: string;
  joinCode: string | null;
  teamName: string;
  isCaptain: boolean;
  onRotate: () => void;
  onSent: () => void;
  onRefresh: () => Promise<void>;
}) {
  const [draft, setDraft] = useState('');
  const [chips, setChips] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<InviteResults | null>(null);
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  const link = typeof window !== 'undefined' && joinCode ? `${window.location.origin}${window.location.pathname}?join=${joinCode}` : '';
  const shareText = `Join my team "${teamName}" on Arcade: ${link}`;

  const copy = async (what: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(what === 'link' ? link : joinCode ?? '');
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      toast.error('Could not copy — select the text and copy it manually.');
    }
  };

  const commit = (value: string) => {
    const next = splitIdentifiers(value).filter((v) => !chips.some((c) => c.toLowerCase() === v.toLowerCase()));
    if (next.length) setChips((c) => [...c, ...next].slice(0, 20));
    setDraft('');
  };

  const send = async () => {
    const all = [...chips, ...splitIdentifiers(draft)];
    if (all.length === 0) return;
    setSending(true);
    try {
      const res = await TeamBoardService.inviteFriends(eventId, all, message);
      setResults(res);
      setChips([]);
      setDraft('');
      setMessage('');
      if (res.sent > 0) toast.success(`${res.sent} invite${res.sent === 1 ? '' : 's'} sent`);
      await onRefresh();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setSending(false);
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Join ${teamName}`, text: shareText, url: link });
      } catch {
        /* the user closed the share sheet */
      }
    } else {
      copy('link');
    }
  };

  return (
    <section className={`${panelClass} relative overflow-hidden`}>
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-gradient-to-br from-amber-300/40 to-pink-400/30 blur-2xl" />
      <h2 className="relative flex items-center gap-2 text-sm font-extrabold text-slate-900">
        <UserPlus size={16} className="text-indigo-500" /> Invite friends
      </h2>
      <p className="relative mt-1 text-xs text-slate-500">Friends without an Arcade account get an email with a link to sign up and join.</p>

      {joinCode && (
        <div className="relative mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 pl-3">
            <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-600">{link}</span>
            <button type="button" className={secondaryButton} onClick={() => copy('link')}>
              {copied === 'link' ? <Check size={13} /> : <Copy size={13} />} {copied === 'link' ? 'Copied' : 'Copy link'}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => copy('code')} className="cursor-pointer rounded-xl border border-dashed border-slate-300 px-3 py-1.5 font-mono text-sm font-black tracking-[0.25em] text-slate-800 hover:bg-slate-50" title="Copy code">
              {joinCode}
            </button>
            <a className={secondaryButton} href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={13} /> WhatsApp
            </a>
            <a className={secondaryButton} href={`mailto:?subject=${encodeURIComponent(`Join my team ${teamName}`)}&body=${encodeURIComponent(shareText)}`}>
              <Mail size={13} /> Email
            </a>
            <button type="button" className={secondaryButton} onClick={nativeShare}>
              <Share2 size={13} /> Share
            </button>
            {isCaptain && (
              <button type="button" className="ml-auto cursor-pointer text-[11px] font-bold text-slate-400 hover:text-slate-700" onClick={onRotate} title="Make a new link; the old one stops working">
                <RefreshCw size={12} className="mr-1 inline" /> New link
              </button>
            )}
          </div>
        </div>
      )}

      <div className="relative mt-5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Invite by username or email</label>
        <div className="mt-1.5 flex min-h-12 flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/90 bg-surface px-2 py-1.5 focus-within:border-[#205ca8] focus-within:ring-4 focus-within:ring-blue-500/10">
          {chips.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
              {c}
              <button type="button" aria-label={`Remove ${c}`} className="cursor-pointer" onClick={() => setChips((all) => all.filter((x) => x !== c))}>
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(e) => {
              const v = e.target.value;
              if (/[\s,;]$/.test(v)) commit(v);
              else setDraft(v);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commit(draft);
              } else if (e.key === 'Backspace' && !draft && chips.length) {
                setChips((all) => all.slice(0, -1));
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              commit(e.clipboardData.getData('text'));
            }}
            placeholder={chips.length ? '' : '@username or friend@email.com'}
            className="min-w-[10rem] flex-1 bg-transparent px-2 py-1.5 text-sm text-slate-800 placeholder-slate-400 outline-none"
          />
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Add a note (optional) — what are you building?"
          className={`${inputClass} mt-2 resize-none`}
        />
        <button type="button" className={`${primaryButton} mt-3 w-full`} disabled={sending || (chips.length === 0 && !draft.trim())} onClick={send}>
          <Send size={14} /> {sending ? 'Sending…' : `Send invite${chips.length > 1 ? 's' : ''}`}
        </button>
      </div>

      {results && results.results.length > 0 && (
        <ul className="relative mt-4 flex flex-col gap-1.5">
          {results.results.map((r) => (
            <li key={r.identifier} className="flex items-start gap-2 text-xs">
              <span className={`mt-0.5 size-2 shrink-0 rounded-full ${r.outcome === 'SKIPPED' ? 'bg-slate-300' : r.outcome === 'EMAILED' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
              <span>
                <strong className="text-slate-800">{r.identifier}</strong> <span className="text-slate-500">— {r.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─────────────────────────────── pieces ───────────────────────────────

function RequestRow({ request, actions }: { request: TeamJoinRequest; actions: React.ReactNode }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {request.person ? (
          <PersonAvatar person={request.person} size={34} />
        ) : (
          <span className="flex size-[34px] items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Mail size={14} />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{request.person?.name ?? request.invitedEmail}</p>
          <p className="truncate text-xs text-slate-500">
            {request.kind === 'INVITE'
              ? request.person
                ? `Invited${request.invitedBy ? ` by ${request.invitedBy.name}` : ''}`
                : 'Emailed — waiting for them to sign up'
              : request.message
                ? `“${request.message}”`
                : 'Wants to join'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </li>
  );
}

function IconButton({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex size-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 transition ${danger ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10' : 'text-slate-500 hover:bg-slate-50'}`}
    >
      {children}
    </button>
  );
}

export function TeamForm({
  tracks,
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  busy,
  disabled,
  className = '',
}: {
  tracks: { id: string; name: string }[];
  initial?: Partial<TeamRequest> & { tagline?: string | null; trackId?: string | null };
  onSubmit: (body: TeamRequest) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
  busy?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [tagline, setTagline] = useState(initial?.tagline ?? '');
  const [trackId, setTrackId] = useState(initial?.trackId ?? '');
  const [looking, setLooking] = useState(initial?.lookingForMembers ?? true);
  const [skills, setSkills] = useState((initial?.skillsWanted ?? []).join(', '));

  return (
    <form
      className={`flex flex-col gap-3 ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name: name.trim(),
          tagline: tagline.trim() || null,
          trackId: trackId || null,
          lookingForMembers: looking,
          skillsWanted: skills.split(',').map((x) => x.trim()).filter(Boolean),
        });
      }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} minLength={2} required placeholder="Team name" className={inputClass} disabled={disabled} />
      <input value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={200} placeholder="One-line pitch (optional)" className={inputClass} disabled={disabled} />
      {tracks.length > 0 && (
        <select value={trackId} onChange={(e) => setTrackId(e.target.value)} className={`${inputClass} cursor-pointer`} disabled={disabled}>
          <option value="">Choose a track (optional)</option>
          {tracks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      )}
      <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills you need, comma-separated — e.g. React, ML, Design" className={inputClass} disabled={disabled} />
      <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
        <input type="checkbox" checked={looking} onChange={(e) => setLooking(e.target.checked)} disabled={disabled} className="size-4 accent-indigo-600" />
        Show us in “Find a team” so others can ask to join
      </label>
      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button type="button" className={secondaryButton} onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className={primaryButton} disabled={disabled || busy || name.trim().length < 2}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
