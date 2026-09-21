'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Granting a badge: pick the badge, pick who gets it, and set the per-grant
 * detail that makes the hover card specific.
 *
 * Rules:
 * - Lives in Apps because it searches, submits and coordinates two services.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from 'react';
import { Building2, Loader2, Search, User as UserIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  RecognitionService,
  VerifiedBadge,
  type BadgeDefinition,
  type RecognitionSubjectType,
} from '@/domains/recognition';
import { UserService } from '@/domains/identity';
import { channelService, type ChannelSummary } from '@/domains/channels';
import { getAvatarUrl } from '@/shared/utils/avatar';

interface SubjectOption {
  id: string;
  name: string;
  secondary?: string;
  avatarUrl?: string | null;
}

export interface BadgeGrantDialogProps {
  definitions: BadgeDefinition[];
  /** Pre-selects a badge when opened from a specific catalog row. */
  initialBadgeCode?: string;
  onClose: () => void;
  onGranted: () => void;
}

export function BadgeGrantDialog({
  definitions,
  initialBadgeCode,
  onClose,
  onGranted,
}: BadgeGrantDialogProps) {
  const grantable = useMemo(
    () => definitions.filter((definition) => definition.active),
    [definitions],
  );

  const [badgeCode, setBadgeCode] = useState(
    initialBadgeCode ?? grantable[0]?.code ?? '',
  );
  const selected = grantable.find((definition) => definition.code === badgeCode);

  // The badge decides what kind of subject may hold it, so the picker follows the badge rather
  // than being chosen independently — a USER-only badge must not offer a channel search whose
  // result the server would then refuse.
  const subjectType: RecognitionSubjectType =
    selected?.appliesTo === 'CHANNEL' ? 'CHANNEL' : 'USER';
  const canChooseType = selected?.appliesTo === 'ANY';
  const [chosenType, setChosenType] = useState<RecognitionSubjectType>('USER');
  const effectiveType = canChooseType ? chosenType : subjectType;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SubjectOption[]>([]);
  const [searching, setSearching] = useState(false);

  // The chosen subject is tagged with the kind it was chosen under. Picking a different badge can
  // change that kind, and a person selected under the previous one is then simply not a valid
  // choice any more — derived here rather than cleared by an effect, which would render one frame
  // with a channel badge pointed at a person.
  const [picked, setPicked] = useState<
    { type: RecognitionSubjectType; option: SubjectOption } | null
  >(null);
  const subject = picked?.type === effectiveType ? picked.option : null;
  const setSubject = (option: SubjectOption | null) =>
    setPicked(option ? { type: effectiveType, option } : null);

  const [title, setTitle] = useState('');
  const [tenure, setTenure] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // A debounced remote search. Clearing results the moment the box is emptied is the correct
    // behaviour; leaving the previous query's matches on screen would invite picking the wrong
    // subject.
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);

    const timer = setTimeout(async () => {
      try {
        if (effectiveType === 'USER') {
          const users = await UserService.searchUsers(query.trim());
          if (cancelled) return;
          setResults(
            users.map((user) => ({
              id: user.id,
              name: user.label,
              secondary: user.handle ? `@${user.handle}` : 'No handle yet',
              avatarUrl: user.avatarUrl,
            })),
          );
        } else {
          // Asked for as a search: active organization channels matching the term, ten of them.
          // This used to fetch every channel — 4,042 rows, 2.5 MB — and apply all three filters in
          // the browser before keeping the first ten.
          const page = await channelService.getChannelSummaries({
            status: 'ACTIVE',
            type: 'ORGANIZATION',
            search: query.trim() || undefined,
            size: 10,
          });
          if (cancelled) return;
          setResults(
            page.content.map((channel: ChannelSummary) => ({
              id: channel.id,
              name: channel.name,
              // The listing endpoint does not resolve the handle registry, so this has always
              // rendered the placeholder. Left as-is rather than made to look resolved.
              secondary: 'No handle yet',
              avatarUrl: channel.iconUrl,
            })),
          );
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, effectiveType]);

  const submit = async () => {
    if (!selected || !subject) return;
    setSubmitting(true);
    try {
      await RecognitionService.grant({
        badgeCode: selected.code,
        subjectType: effectiveType,
        subjectId: subject.id,
        title: title.trim() || undefined,
        tenure: tenure.trim() || undefined,
        note: note.trim() || undefined,
      });
      toast.success(`${selected.displayName} granted to ${subject.name}`);
      onGranted();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not grant that badge.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm dark:bg-black/60">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[22px] border border-slate-100 bg-white p-6 shadow-2xl dark:border-neutral-900 dark:bg-black">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[17px] font-extrabold tracking-tight text-slate-900 dark:text-white">
              Grant a badge
            </h2>
            <p className="mt-1 text-[12.5px] font-medium text-slate-500 dark:text-neutral-400">
              A badge is recognition, not permission. Granting one changes what
              Arcade says about this account, never what it can do.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:text-neutral-600 dark:hover:bg-neutral-900"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200">
              Badge
            </label>
            <div className="mt-2 grid gap-2">
              {grantable.map((definition) => (
                <button
                  key={definition.code}
                  type="button"
                  onClick={() => setBadgeCode(definition.code)}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                    definition.code === badgeCode
                      ? 'border-slate-900 bg-slate-50 dark:border-neutral-400 dark:bg-neutral-900'
                      : 'border-slate-200 hover:border-slate-300 dark:border-neutral-800 dark:hover:border-neutral-700'
                  }`}
                >
                  <VerifiedBadge
                    badge={{
                      code: definition.code,
                      label: definition.displayName,
                      description: definition.description,
                      category: definition.category,
                      icon: definition.icon,
                      accentColor: definition.accentColor,
                      effect: definition.effect,
                      displayOrder: definition.displayOrder,
                      grantedAt: new Date().toISOString(),
                    }}
                    size={18}
                    showDetailOnHover={false}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {definition.displayName}
                    </span>
                    <span className="block text-[11px] font-bold text-slate-400 dark:text-neutral-500">
                      {definition.category} · applies to {definition.appliesTo}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {canChooseType && (
            <div className="flex gap-2">
              {(['USER', 'CHANNEL'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setChosenType(type)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-[12.5px] font-extrabold tracking-tight transition-colors ${
                    chosenType === type
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black'
                      : 'border-slate-200 text-slate-500 dark:border-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  {type === 'USER' ? 'A person' : 'A channel'}
                </button>
              ))}
            </div>
          )}

          <div>
            <label className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200">
              {effectiveType === 'USER' ? 'Who gets it' : 'Which channel'}
            </label>

            {subject ? (
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-900 px-3.5 py-2.5 dark:border-neutral-400">
                <SubjectAvatar option={subject} type={effectiveType} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-extrabold text-slate-900 dark:text-white">
                    {subject.name}
                  </span>
                  <span className="block text-[11px] font-bold text-slate-400 dark:text-neutral-500">
                    {subject.secondary}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setSubject(null)}
                  className="rounded-lg p-1 text-slate-300 hover:text-slate-600 dark:text-neutral-600"
                  aria-label="Choose someone else"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="relative mt-2">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-neutral-600"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      effectiveType === 'USER'
                        ? 'Search by name or handle'
                        : 'Search organization channels'
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-[13.5px] font-semibold text-slate-900 outline-none transition-colors focus:border-slate-900 placeholder:font-medium placeholder:text-slate-300 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-400"
                  />
                  {searching && (
                    <Loader2
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-slate-300"
                    />
                  )}
                </div>

                {results.length > 0 && (
                  <ul className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-slate-100 dark:border-neutral-900">
                    {results.map((option) => (
                      <li key={option.id}>
                        <button
                          type="button"
                          onClick={() => setSubject(option)}
                          className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-neutral-900"
                        >
                          <SubjectAvatar option={option} type={effectiveType} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-bold text-slate-900 dark:text-white">
                              {option.name}
                            </span>
                            <span className="block truncate text-[11px] font-bold text-slate-400 dark:text-neutral-500">
                              {option.secondary}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200">
                Title <span className="font-bold text-slate-300">(optional)</span>
              </label>
              <p className="mt-1 text-[11.5px] font-medium text-slate-400 dark:text-neutral-500">
                Replaces the badge name for this holder.
              </p>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder={selected?.displayName ?? 'Arcade Team Lead'}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-slate-900 outline-none focus:border-slate-900 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-400"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200">
                Tenure <span className="font-bold text-slate-300">(optional)</span>
              </label>
              <p className="mt-1 text-[11.5px] font-medium text-slate-400 dark:text-neutral-500">
                Shown under the title on hover.
              </p>
              <input
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                maxLength={40}
                placeholder="2025-26"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-slate-900 outline-none focus:border-slate-900 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200">
              Note <span className="font-bold text-slate-300">(optional)</span>
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={280}
              placeholder="Led the exam platform rewrite"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-slate-900 outline-none focus:border-slate-900 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-400"
            />
          </div>
        </div>

        <div className="mt-7 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-[13px] font-extrabold tracking-tight text-slate-500 transition-colors hover:bg-slate-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!selected || !subject || submitting}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-extrabold tracking-tight text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {submitting ? 'Granting…' : 'Grant badge'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SubjectAvatar({
  option,
  type,
}: {
  option: SubjectOption;
  type: RecognitionSubjectType;
}) {
  const Fallback = type === 'CHANNEL' ? Building2 : UserIcon;
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden bg-slate-50 dark:bg-neutral-900 ${
        type === 'CHANNEL' ? 'rounded-xl' : 'rounded-full'
      }`}
    >
      {option.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getAvatarUrl(option.avatarUrl)}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <Fallback size={14} className="text-slate-300 dark:text-neutral-700" />
      )}
    </span>
  );
}
