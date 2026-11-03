'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Hand, Search, Users } from 'lucide-react';
import { TeamBoardService, TeamCardView, type TeamBoard, type TeamCard } from '@/domains/events';
import { errorText, inputClass, primaryButton, secondaryButton } from './hackathonUtils';

/** Browse recruiting teams and ask to join one. */
export function FindTeamPanel({ eventId, board, onBoard }: { eventId: string; board: TeamBoard; onBoard: (b: TeamBoard) => void }) {
  const query = useQuery({
    queryKey: ['competition', eventId, 'teams'],
    queryFn: () => TeamBoardService.browse(eventId),
    enabled: board.registered,
    retry: false,
  });
  const [search, setSearch] = useState('');
  const [track, setTrack] = useState('');
  const [recruitingOnly, setRecruitingOnly] = useState(true);
  const [asking, setAsking] = useState<TeamCard | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const teams = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (query.data ?? []).filter(
      (t) =>
        (!recruitingOnly || (t.lookingForMembers && t.memberCount < t.maxTeamSize)) &&
        (!track || t.trackId === track) &&
        (!q || t.name.toLowerCase().includes(q) || (t.tagline ?? '').toLowerCase().includes(q) || t.skillsWanted.some((s) => s.toLowerCase().includes(q))),
    );
  }, [query.data, search, track, recruitingOnly]);

  if (!board.registered) {
    return <p className="py-16 text-center text-sm text-slate-500">Register for the event to browse teams.</p>;
  }

  const send = async () => {
    if (!asking) return;
    setBusy(true);
    try {
      onBoard(await TeamBoardService.requestToJoin(eventId, asking.id, message));
      toast.success(`Request sent to ${asking.name}. The captain will get a notification.`);
      setAsking(null);
      setMessage('');
      void query.refetch();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search teams, pitches or skills" className={`${inputClass} pl-10`} />
        </div>
        {board.competition.tracks.length > 0 && (
          <select value={track} onChange={(e) => setTrack(e.target.value)} className={`${inputClass} cursor-pointer sm:w-56`}>
            <option value="">All tracks</option>
            {board.competition.tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
          <input type="checkbox" checked={recruitingOnly} onChange={(e) => setRecruitingOnly(e.target.checked)} className="size-4 accent-indigo-600" />
          Recruiting only
        </label>
      </div>

      {query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-3xl bg-slate-100" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Users className="text-slate-300" size={32} />
          <p className="text-sm font-bold text-slate-700">No teams match</p>
          <p className="text-xs text-slate-500">Start your own team from “Get on a team” — you can invite friends straight away.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <TeamCardView
              key={t.id}
              team={t}
              action={
                t.requestPending ? (
                  <span className="text-[11px] font-bold text-amber-600">Request sent</span>
                ) : t.memberCount < t.maxTeamSize ? (
                  <button type="button" className={secondaryButton} onClick={() => setAsking(t)}>
                    <Hand size={13} /> Ask to join
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}

      {asking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" role="dialog" aria-modal onClick={() => setAsking(null)}>
          <div className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900">Ask to join {asking.name}</h3>
            <p className="mt-1 text-xs text-slate-500">Say what you bring — the captain sees this with your profile.</p>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={4} placeholder="Hi! I'm a backend dev with Spring Boot experience…" className={`${inputClass} mt-4 resize-none`} />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className={secondaryButton} onClick={() => setAsking(null)}>
                Cancel
              </button>
              <button type="button" className={primaryButton} onClick={send} disabled={busy}>
                {busy ? 'Sending…' : 'Send request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
