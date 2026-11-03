'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Lock, Rocket, Save, Undo2 } from 'lucide-react';
import {
  CompetitionChip,
  SubmissionFormFields,
  TeamBoardService,
  formatCompetitionDate,
  type CompetitionSubmission,
  type SubmissionAnswer,
  type TeamBoard,
} from '@/domains/events';
import { errorText, inputClass, panelClass, primaryButton, secondaryButton } from './hackathonUtils';

/**
 * The team's project: a title plus whatever the organiser's form asks for. Any member can edit it
 * while submissions are open; the checklist on the right is the backend's `missingRequirements`,
 * so "can we submit?" is never guessed here.
 */
export function ProjectPanel({
  eventId,
  board,
  onSaved,
}: {
  eventId: string;
  board: TeamBoard;
  onSaved: (submission: CompetitionSubmission) => void;
}) {
  const s = board.competition.settings;
  const fields = board.competition.fields;
  const sub = board.submission;
  const editable = s.submissionsOpen && board.team?.status === 'ACTIVE';

  const [title, setTitle] = useState(sub?.title ?? '');
  const [tagline, setTagline] = useState(sub?.tagline ?? '');
  const [trackId, setTrackId] = useState<string | null>(sub?.trackId ?? board.team?.trackId ?? null);
  const [answers, setAnswers] = useState<Record<string, SubmissionAnswer>>(sub?.answers ?? {});
  const [busy, setBusy] = useState<'save' | 'submit' | 'withdraw' | null>(null);
  const [dirty, setDirty] = useState(false);

  const save = async (): Promise<CompetitionSubmission | null> => {
    setBusy('save');
    try {
      const saved = await TeamBoardService.saveSubmission(eventId, { title: title.trim(), tagline: tagline.trim() || null, answers, trackId });
      onSaved(saved);
      setDirty(false);
      toast.success('Project saved');
      return saved;
    } catch (e) {
      toast.error(errorText(e));
      return null;
    } finally {
      setBusy(null);
    }
  };

  const submit = async () => {
    if (dirty || !sub) {
      const saved = await save();
      if (!saved) return;
      if (saved.missingRequirements.length > 0) {
        toast.error('Almost there — finish the checklist first.');
        return;
      }
    }
    setBusy('submit');
    try {
      onSaved(await TeamBoardService.submit(eventId));
      toast.success('Submitted! You can keep improving it until the deadline.');
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(null);
    }
  };

  const withdraw = async () => {
    setBusy('withdraw');
    try {
      onSaved(await TeamBoardService.withdraw(eventId));
      toast.success('Moved back to draft');
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(null);
    }
  };

  const missing = sub?.missingRequirements ?? ['Save your project details'];

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <form
        className={`${panelClass} flex flex-col gap-5 lg:col-span-2`}
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black tracking-tight text-slate-900">Your project</h2>
          {sub && (
            <CompetitionChip tone={sub.status === 'SUBMITTED' ? 'green' : 'amber'}>
              {sub.status === 'SUBMITTED' ? 'Submitted' : 'Draft'} · rev {sub.revision}
            </CompetitionChip>
          )}
        </div>

        {!editable && (
          <p className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
            <Lock size={14} />
            {s.phase === 'TEAM_FORMATION'
              ? `Submissions open ${formatCompetitionDate(s.submissionOpensAt)}. Plan your idea in the meantime.`
              : 'Submissions are closed — this is what the judges see.'}
          </p>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Project name <span className="text-rose-500">*</span>
          </span>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setDirty(true);
            }}
            maxLength={120}
            required
            disabled={!editable}
            className={inputClass}
            placeholder="e.g. FloodWatch"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tagline</span>
          <input
            value={tagline}
            onChange={(e) => {
              setTagline(e.target.value);
              setDirty(true);
            }}
            maxLength={200}
            disabled={!editable}
            className={inputClass}
            placeholder="One sentence a judge will remember"
          />
        </label>
        {board.competition.tracks.length > 0 && (
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Track</span>
            <select
              value={trackId ?? ''}
              onChange={(e) => {
                setTrackId(e.target.value || null);
                setDirty(true);
              }}
              disabled={!editable}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Same as the team&rsquo;s track</option>
              {board.competition.tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {fields.length > 0 && <div className="border-t border-slate-100" />}
        <SubmissionFormFields
          fields={fields}
          answers={answers}
          disabled={!editable}
          onUpload={(fieldId, file, onProgress) => TeamBoardService.uploadFile(eventId, fieldId, file, onProgress)}
          onChange={(id, v) => {
            setAnswers((a) => {
              const next = { ...a };
              if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) delete next[id];
              else next[id] = v;
              return next;
            });
            setDirty(true);
          }}
        />

        {editable && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-5">
            <button type="submit" className={secondaryButton} disabled={busy !== null || !title.trim()}>
              <Save size={14} /> {busy === 'save' ? 'Saving…' : 'Save draft'}
            </button>
            {sub?.status === 'SUBMITTED' ? (
              <>
                <button type="button" className={secondaryButton} onClick={withdraw} disabled={busy !== null}>
                  <Undo2 size={14} /> Back to draft
                </button>
                {dirty && (
                  <button type="button" className={primaryButton} onClick={() => void save()} disabled={busy !== null}>
                    Update submission
                  </button>
                )}
              </>
            ) : (
              <button type="button" className={primaryButton} onClick={submit} disabled={busy !== null || !title.trim()}>
                <Rocket size={14} /> {busy === 'submit' ? 'Submitting…' : 'Submit project'}
              </button>
            )}
          </div>
        )}
      </form>

      <aside className="flex flex-col gap-5">
        <section className={panelClass}>
          <h3 className="text-sm font-extrabold text-slate-900">Ready to submit?</h3>
          {sub?.status === 'SUBMITTED' ? (
            <p className="mt-3 flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 size={16} className="shrink-0" /> Submitted {formatCompetitionDate(sub.submittedAt)}. Edits keep it submitted and bump the revision.
            </p>
          ) : missing.length === 0 ? (
            <p className="mt-3 flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 size={16} className="shrink-0" /> Everything&rsquo;s in. Hit Submit.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {missing.map((m) => (
                <li key={m} className="flex items-start gap-2 text-xs text-slate-600">
                  <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-500" /> {m}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className={panelClass}>
          <h3 className="text-sm font-extrabold text-slate-900">Deadline</h3>
          <p className="mt-2 text-sm font-bold text-slate-800">{formatCompetitionDate(s.submissionDeadline)}</p>
          <p className="mt-1 text-xs text-slate-500">Judges see your project only after this, and never see who you are — only what you built.</p>
        </section>
      </aside>
    </div>
  );
}
