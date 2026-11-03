"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Ban, Download, Gavel, Inbox, Medal, Megaphone, RotateCcw, Rocket, Trophy, Users, X } from "lucide-react";
import {
  CompetitionAdminService,
  CompetitionChip,
  LeaderboardTable,
  PHASE_LABEL,
  formatCompetitionDate,
  SubmissionAnswersView,
  type AdminSubmission,
  type CompetitionSummary,
  type SubmissionField,
  type Competition,
  type CompetitionTeam,
  type LeaderboardEntry,
} from "@/domains/events";
import {
  WorkspaceChoice,
  WorkspaceHeading,
  WorkspaceLoading,
  WorkspaceMessage,
  WorkspacePrimaryButton,
  WorkspaceRow,
  WorkspaceRows,
  WorkspaceStat,
  workspaceField,
  workspaceSecondaryButton,
} from "@/apps/creator/studio/core/StudioWorkspaceKit";

const errorText = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");

export type TeamDeskPage = "teams" | "submissions" | "results";

/**
 * Running the competition, one page per job: Teams (oversight, disqualify), Submissions (every
 * project with its judging progress and scorecards) and Leaderboard & results (ranking, winners,
 * publishing). Organisers see who built what; judges never do.
 */
export function TeamEventDeskSection({ eventId, page, onOpenSetup }: { eventId: string; page: TeamDeskPage; onOpenSetup: () => void }) {
  const queryClient = useQueryClient();
  const competition = useQuery({ queryKey: ["competition", eventId, "admin"], queryFn: () => CompetitionAdminService.get(eventId), retry: false });
  const enabled = !!competition.data;
  const summary = useQuery({ queryKey: ["competition", eventId, "summary"], queryFn: () => CompetitionAdminService.summary(eventId), enabled, retry: false });
  const [publishing, setPublishing] = useState(false);
  const refreshAll = () => queryClient.invalidateQueries({ queryKey: ["competition", eventId] });

  if (competition.isLoading) return <WorkspaceLoading />;
  if (!competition.data) {
    return (
      <WorkspaceMessage
        icon={Gavel}
        title="No team competition yet"
        action={<WorkspacePrimaryButton onClick={onOpenSetup} icon={<Rocket size={16} />}>Set it up</WorkspacePrimaryButton>}
      >
        Switch on the team competition to collect submissions and judge them here.
      </WorkspaceMessage>
    );
  }

  if (page === "teams") {
    return (
      <div className="flex flex-col gap-8">
        <WorkspaceHeading icon={Users} title="Teams" description="Every team, its members and where its project stands. Disqualified teams leave the leaderboard and lose any award." />
        <TeamsView eventId={eventId} onChanged={refreshAll} />
      </div>
    );
  }
  if (page === "submissions") {
    return (
      <div className="flex flex-col gap-8">
        <WorkspaceHeading
          icon={Inbox}
          title="Submissions"
          description={`${PHASE_LABEL[competition.data.settings.phase]} · submissions close ${formatCompetitionDate(competition.data.settings.submissionDeadline)}. Open a project for its answers and every judge's scorecard.`}
        />
        {summary.data && <DeskStats sm={summary.data} />}
        <SubmissionsView eventId={eventId} competition={competition.data} />
      </div>
    );
  }

  const c = competition.data;
  const sm = summary.data;
  const published = !!c.settings.resultsPublishedAt;
  const progress = sm && sm.expectedEvaluations > 0 ? Math.round((sm.finalEvaluations / sm.expectedEvaluations) * 100) : 0;

  const togglePublish = async () => {
    if (!published && !confirm("Publish results? Participants will see the leaderboard, winners and judges' feedback, and scoring locks.")) return;
    setPublishing(true);
    try {
      queryClient.setQueryData(["competition", eventId, "admin"], published ? await CompetitionAdminService.unpublishResults(eventId) : await CompetitionAdminService.publishResults(eventId));
      toast.success(published ? "Results hidden — judging re-opened" : "Results published and participants notified");
      refreshAll();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <WorkspaceHeading
        icon={Medal}
        title="Leaderboard & results"
        description={`Live ranking from finalised scorecards. ${published ? `Published ${formatCompetitionDate(c.settings.resultsPublishedAt)}.` : "Only you can see it until you publish."}`}
        actions={
          published ? (
            <button type="button" className={workspaceSecondaryButton} onClick={togglePublish} disabled={publishing}>
              <RotateCcw size={14} /> Unpublish results
            </button>
          ) : (
            <WorkspacePrimaryButton onClick={togglePublish} disabled={publishing} icon={<Megaphone size={16} />}>
              {publishing ? "Publishing…" : "Publish results"}
            </WorkspacePrimaryButton>
          )
        }
      />

      {sm && (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between text-xs font-bold text-slate-600">
            <span>Judging progress</span>
            <span>
              {sm.finalEvaluations}/{sm.expectedEvaluations} scorecards · {progress}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <LeaderboardView eventId={eventId} competition={c} onChanged={refreshAll} />
    </div>
  );
}

function DeskStats({ sm }: { sm: CompetitionSummary }) {
  const progress = sm.expectedEvaluations > 0 ? Math.round((sm.finalEvaluations / sm.expectedEvaluations) * 100) : 0;
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      <WorkspaceStat icon={Users} label="Teams" value={sm.activeTeams} hint={sm.teams > sm.activeTeams ? `${sm.teams - sm.activeTeams} disqualified` : `${sm.participantsInTeams} participants`} />
      <WorkspaceStat icon={Rocket} label="Submitted" value={sm.submittedSubmissions} hint={`${sm.draftSubmissions} still drafting`} />
      <WorkspaceStat icon={Gavel} label="Judges" value={sm.judges} hint="accepted" />
      <WorkspaceStat icon={Trophy} label="Scored" value={`${progress}%`} hint={`${sm.finalEvaluations}/${sm.expectedEvaluations} scorecards`} />
    </div>
  );
}

// ───────────────────────── submissions ─────────────────────────

function SubmissionsView({ eventId, competition }: { eventId: string; competition: Competition }) {
  const query = useQuery({ queryKey: ["competition", eventId, "submissions"], queryFn: () => CompetitionAdminService.submissions(eventId), retry: false });
  const [filter, setFilter] = useState<"ALL" | "SUBMITTED" | "DRAFT">("ALL");
  const [open, setOpen] = useState<string | null>(null);
  const rows = (query.data ?? []).filter((r) => filter === "ALL" || r.submission.status === filter);

  if (query.isLoading) return <WorkspaceLoading />;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <WorkspaceChoice
          value={filter}
          onChange={setFilter}
          options={[
            { value: "ALL", label: `All (${query.data?.length ?? 0})` },
            { value: "SUBMITTED", label: "Submitted" },
            { value: "DRAFT", label: "Drafts" },
          ]}
        />
        <button type="button" className={workspaceSecondaryButton} onClick={() => exportSubmissions(query.data ?? [], competition.fields)} disabled={!query.data?.length}>
          <Download size={14} /> Export CSV
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="py-10 text-center text-xs font-medium text-slate-400">No submissions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 pr-3">Project</th>
                <th className="py-2.5 pr-3">Team</th>
                <th className="py-2.5 pr-3">Status</th>
                <th className="py-2.5 pr-3">Judging</th>
                <th className="py-2.5 pr-3 text-right">Avg</th>
                <th className="py-2.5 text-right">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.submission.id} onClick={() => setOpen(r.submission.id)} className="cursor-pointer hover:bg-slate-50">
                  <td className="py-3 pr-3">
                    <p className="font-bold text-slate-900">{r.submission.title}</p>
                    {r.submission.trackName && <p className="text-xs text-slate-500">{r.submission.trackName}</p>}
                  </td>
                  <td className="py-3 pr-3 text-xs text-slate-600">
                    {r.submission.teamName}
                    <span className="text-slate-400"> · {r.members.length}</span>
                  </td>
                  <td className="py-3 pr-3">
                    <CompetitionChip tone={r.submission.status === "SUBMITTED" ? "green" : "amber"}>{r.submission.status === "SUBMITTED" ? "Submitted" : "Draft"}</CompetitionChip>
                  </td>
                  <td className="py-3 pr-3 text-xs text-slate-600">
                    {r.submission.status === "SUBMITTED" ? (
                      <>
                        <span className="font-bold text-slate-900">{r.finalEvaluations}</span>/{r.judgesAssigned} final
                        {r.draftEvaluations > 0 && <span className="text-amber-600"> · {r.draftEvaluations} in progress</span>}
                      </>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-right font-black tabular-nums text-slate-900">{r.averageScore != null ? Number(r.averageScore).toFixed(1) : "—"}</td>
                  <td className="py-3 text-right text-xs font-bold text-slate-600">{r.rank ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && <SubmissionDrawer eventId={eventId} submissionId={open} fields={competition.fields} onClose={() => setOpen(null)} />}
    </div>
  );
}

function SubmissionDrawer({ eventId, submissionId, fields, onClose }: { eventId: string; submissionId: string; fields: SubmissionField[]; onClose: () => void }) {
  const query = useQuery({ queryKey: ["competition", eventId, "submission", submissionId], queryFn: () => CompetitionAdminService.submission(eventId, submissionId), retry: false });
  const d = query.data;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" data-studio-overlay onClick={onClose}>
      <aside className="h-full w-full max-w-2xl overflow-y-auto bg-surface p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close" className="float-right cursor-pointer rounded-full p-2 text-slate-400 hover:bg-slate-100">
          <X size={18} />
        </button>
        {!d ? (
          <WorkspaceLoading />
        ) : (
          <div className="flex flex-col gap-6">
            <header>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{d.summary.submission.teamName}</p>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{d.summary.submission.title}</h2>
              {d.summary.submission.tagline && <p className="text-sm text-slate-500">{d.summary.submission.tagline}</p>}
            </header>
            <section>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Team</h3>
              <ul className="mt-2 flex flex-col gap-1 text-xs text-slate-700">
                {d.summary.members.map((m) => (
                  <li key={m.userId}><strong>{m.name}</strong> <span className="text-slate-400">{m.email}</span></li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Answers</h3>
              <SubmissionAnswersView fields={fields} answers={d.summary.submission.answers} compact />
            </section>
            <section>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scorecards</h3>
              {d.evaluations.length === 0 ? (
                <p className="mt-2 text-xs text-slate-400">No judge has scored this yet.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-3">
                  {d.evaluations.map((e) => (
                    <li key={e.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900">{e.judge?.name}</p>
                        <span className="flex items-center gap-2">
                          <CompetitionChip tone={e.status === "FINAL" ? "green" : "amber"}>{e.status === "FINAL" ? "Final" : "Draft"}</CompetitionChip>
                          <span className="text-lg font-black tabular-nums text-slate-900">{e.totalScore != null ? Number(e.totalScore).toFixed(1) : "—"}</span>
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                        {d.criteria.map((c) => (
                          <span key={c.id}>{c.name}: <strong>{e.scores[c.id] ?? "–"}</strong>/{c.maxScore}</span>
                        ))}
                      </div>
                      {e.feedback && <p className="mt-2 text-xs text-slate-700"><strong>Feedback:</strong> {e.feedback}</p>}
                      {e.comment && <p className="mt-1 text-xs text-slate-500"><strong>Private:</strong> {e.comment}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}

// ───────────────────────── teams ─────────────────────────

function TeamsView({ eventId, onChanged }: { eventId: string; onChanged: () => void }) {
  const query = useQuery({ queryKey: ["competition", eventId, "teams"], queryFn: () => CompetitionAdminService.teams(eventId), retry: false });
  const [search, setSearch] = useState("");
  const teams = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (query.data ?? []).filter((t) => !q || t.name.toLowerCase().includes(q) || t.members.some((m) => (m.person.name ?? "").toLowerCase().includes(q) || (m.person.email ?? "").toLowerCase().includes(q)));
  }, [query.data, search]);

  const act = async (t: CompetitionTeam) => {
    try {
      if (t.status === "ACTIVE") {
        const reason = prompt(`Disqualify ${t.name}? Give a reason the team will see:`);
        if (reason === null) return;
        await CompetitionAdminService.disqualify(eventId, t.id, reason);
        toast.success(`${t.name} disqualified`);
      } else {
        await CompetitionAdminService.reinstate(eventId, t.id);
        toast.success(`${t.name} reinstated`);
      }
      onChanged();
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  if (query.isLoading) return <WorkspaceLoading />;
  return (
    <div className="flex flex-col gap-4">
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search teams or members" className={workspaceField.input} />
      {teams.length === 0 ? (
        <p className="py-10 text-center text-xs font-medium text-slate-400">No teams yet.</p>
      ) : (
        <WorkspaceRows>
          {teams.map((t, i) => (
            <WorkspaceRow
              key={t.id}
              step={i + 1}
              title={t.name}
              description={t.tagline ?? undefined}
              aside={
                <>
                  {t.trackName && <CompetitionChip tone="violet">{t.trackName}</CompetitionChip>}
                  <CompetitionChip tone={t.submissionStatus === "SUBMITTED" ? "green" : t.submissionStatus === "DRAFT" ? "amber" : "neutral"}>
                    {t.submissionStatus === "NONE" ? "No project" : t.submissionStatus === "DRAFT" ? "Draft" : "Submitted"}
                  </CompetitionChip>
                  {t.status === "DISQUALIFIED" && <CompetitionChip tone="red">Disqualified</CompetitionChip>}
                </>
              }
            >
              <ul className="flex flex-col gap-1 text-xs text-slate-700">
                {t.members.map((m) => (
                  <li key={m.person.userId}>
                    <strong>{m.person.name}</strong>
                    {m.captain && <span className="text-amber-600"> · captain</span>}
                    <span className="text-slate-400"> {m.person.email}</span>
                  </li>
                ))}
              </ul>
              {t.statusReason && <p className="mt-2 text-xs text-rose-600">Reason: {t.statusReason}</p>}
              <div className="mt-3">
                <button type="button" className={workspaceSecondaryButton} onClick={() => act(t)}>
                  {t.status === "ACTIVE" ? <><Ban size={13} /> Disqualify</> : <><RotateCcw size={13} /> Reinstate</>}
                </button>
              </div>
            </WorkspaceRow>
          ))}
        </WorkspaceRows>
      )}
    </div>
  );
}

// ───────────────────────── leaderboard & prizes ─────────────────────────

function LeaderboardView({ eventId, competition, onChanged }: { eventId: string; competition: Competition; onChanged: () => void }) {
  const query = useQuery({ queryKey: ["competition", eventId, "leaderboard"], queryFn: () => CompetitionAdminService.leaderboard(eventId), retry: false });
  const entries = query.data ?? [];
  if (query.isLoading) return <WorkspaceLoading />;

  return (
    <WorkspaceRows>
      <WorkspaceRow
        step={1}
        title="Live ranking"
        description="Mean of each project's final scorecards. Ties share a rank. Only you see this until results are published."
        aside={
          <button type="button" className={workspaceSecondaryButton} onClick={() => exportLeaderboard(entries, competition)} disabled={entries.length === 0}>
            <Download size={14} /> Export CSV
          </button>
        }
        wide
      >
        <LeaderboardTable entries={entries} criteria={competition.criteria.map((c) => ({ id: c.id, name: c.name }))} />
      </WorkspaceRow>
      <WorkspaceRow step={2} title="Award winners" description="Pick the winning team for each prize. Winners stay hidden until you publish results." wide>
        {competition.awards.length === 0 ? (
          <p className="text-xs text-slate-400">Add prizes on the Hackathon tab first.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-slate-100">
            {competition.awards.map((a) => (
              <li key={a.id} className="grid items-center gap-3 py-3 sm:grid-cols-[1fr_280px]">
                <div className="flex items-center gap-3">
                  <Trophy size={16} className="text-amber-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.prize}</p>
                  </div>
                </div>
                <select
                  value={a.teamId ?? ""}
                  className={workspaceField.select}
                  onChange={async (e) => {
                    try {
                      await CompetitionAdminService.setWinner(eventId, a.id, e.target.value || null);
                      onChanged();
                    } catch (err) {
                      toast.error(errorText(err));
                    }
                  }}
                >
                  <option value="">No winner yet</option>
                  {entries
                    .filter((x) => !a.trackId || x.trackId === a.trackId)
                    .map((x) => (
                      <option key={x.teamId} value={x.teamId}>
                        {x.rank > 0 ? `#${x.rank} ` : ""}
                        {x.teamName} — {x.title}
                      </option>
                    ))}
                </select>
              </li>
            ))}
          </ul>
        )}
      </WorkspaceRow>
    </WorkspaceRows>
  );
}

// ───────────────────────── CSV ─────────────────────────

function downloadCsv(name: string, rows: (string | number | null | undefined)[][]) {
  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/** One column per form question, so the export is the full submission record. */
function exportSubmissions(rows: AdminSubmission[], fields: SubmissionField[]) {
  const cell = (v: unknown) => (Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v));
  downloadCsv("submissions.csv", [
    ["Project", "Tagline", "Team", "Track", "Status", "Submitted at", "Members", ...fields.map((f) => f.label), "Final scorecards", "Average", "Rank"],
    ...rows.map((r) => [
      r.submission.title, r.submission.tagline, r.submission.teamName, r.submission.trackName, r.submission.status, r.submission.submittedAt,
      r.members.map((m) => `${m.name} <${m.email ?? ""}>`).join("; "),
      ...fields.map((f) => cell(r.submission.answers[f.id])),
      r.finalEvaluations, r.averageScore, r.rank,
    ]),
  ]);
}

function exportLeaderboard(entries: LeaderboardEntry[], competition: Competition) {
  downloadCsv("leaderboard.csv", [
    ["Rank", "Team", "Project", "Track", ...competition.criteria.map((c) => c.name), "Judges", "Score", "Awards"],
    ...entries.map((e) => [
      e.rank || "", e.teamName, e.title, e.trackName,
      ...competition.criteria.map((c) => e.criterionAverages[c.id] ?? ""),
      e.finalEvaluations, e.averageScore, e.awards.join("; "),
    ]),
  ]);
}
