"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Eye,
  Gavel,
  Lightbulb,
  Lock,
  Mail,
  Plus,
  RotateCcw,
  Rocket,
  Scale,
  Trash2,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import {
  CompetitionAdminService,
  CompetitionChip,
  FIELD_TYPE_LABEL,
  PHASE_LABEL,
  SubmissionFormFields,
  type Competition,
  type CompetitionJudge,
  type SubmissionAnswer,
  type SubmissionField,
  type SubmissionFieldType,
  type UpdateCompetitionRequest,
} from "@/domains/events";
import {
  WorkspaceChoice,
  WorkspaceHeading,
  WorkspaceLabel,
  WorkspaceLoading,
  WorkspaceMessage,
  WorkspacePrimaryButton,
  WorkspaceRow,
  WorkspaceRows,
  WorkspaceSaveBar,
  WorkspaceStat,
  workspaceField,
  workspaceSecondaryButton,
} from "@/apps/creator/studio/core/StudioWorkspaceKit";

const errorText = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");

/** ISO instant → the value a `datetime-local` input shows, in the organiser's own time zone. */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

export type TeamSetupPage = "setup" | "form" | "tracks" | "rubric" | "prizes" | "judges";

/**
 * The organiser's team-competition setup, one page per concern: setup & timeline, the submission
 * form, tracks, rubric, prizes and judges. All pages share one competition read. Every rule is
 * validated by the backend; these pages only collect it.
 */
export function TeamEventSetupSection({
  eventId,
  page,
  onSelectTab,
}: {
  eventId: string;
  page: TeamSetupPage;
  onSelectTab?: (tab: string) => void;
}) {
  const queryClient = useQueryClient();
  const key = ["competition", eventId, "admin"];
  const query = useQuery({ queryKey: key, queryFn: () => CompetitionAdminService.get(eventId), retry: false });
  const reload = () => queryClient.invalidateQueries({ queryKey: ["competition", eventId] });
  const [creating, setCreating] = useState(false);

  if (query.isLoading) return <WorkspaceLoading />;
  if (query.error) return <WorkspaceMessage tone="warning" title="Could not load the competition">{errorText(query.error)}</WorkspaceMessage>;

  if (!query.data) {
    return (
      <WorkspaceMessage
        icon={Rocket}
        title="Run this event as a team competition"
        action={
          <WorkspacePrimaryButton
            icon={<Users size={16} />}
            disabled={creating}
            onClick={async () => {
              setCreating(true);
              try {
                queryClient.setQueryData(key, await CompetitionAdminService.update(eventId, { enabled: true, minTeamSize: 1, maxTeamSize: 4 }));
                toast.success("Team competition switched on — a starter form and rubric are ready to edit");
                reload();
              } catch (e) {
                toast.error(errorText(e));
              } finally {
                setCreating(false);
              }
            }}
          >
            {creating ? "Setting up…" : "Switch on team competition"}
          </WorkspacePrimaryButton>
        }
      >
        Hackathons, buildathons, case challenges: registered participants form teams and invite friends, submit what your form asks for, and invited judges
        score each project blind. You publish the leaderboard and winners when judging is done.
      </WorkspaceMessage>
    );
  }

  const c = query.data;
  switch (page) {
    case "setup":
      return <SetupPage eventId={eventId} competition={c} onSaved={(n) => queryClient.setQueryData(key, n)} onSelectTab={onSelectTab} />;
    case "form":
      return <FormBuilderPage eventId={eventId} competition={c} onChanged={reload} />;
    case "tracks":
      return <TracksPage eventId={eventId} competition={c} onChanged={reload} />;
    case "rubric":
      return <RubricPage eventId={eventId} competition={c} onChanged={reload} />;
    case "prizes":
      return <PrizesPage eventId={eventId} competition={c} onChanged={reload} />;
    case "judges":
      return <JudgesPage eventId={eventId} competition={c} />;
  }
}

// ───────────────────────── setup & timeline ─────────────────────────

function SetupPage({
  eventId,
  competition,
  onSaved,
  onSelectTab,
}: {
  eventId: string;
  competition: Competition;
  onSaved: (c: Competition) => void;
  onSelectTab?: (tab: string) => void;
}) {
  const s = competition.settings;
  // Seeded once; after a save the server's answer equals what the form already holds.
  const [form, setForm] = useState<UpdateCompetitionRequest>(() => ({
    enabled: s.enabled,
    minTeamSize: s.minTeamSize,
    maxTeamSize: s.maxTeamSize,
    maxTeams: s.maxTeams,
    teamFormationDeadline: s.teamFormationDeadline,
    submissionOpensAt: s.submissionOpensAt,
    submissionDeadline: s.submissionDeadline,
    judgingDeadline: s.judgingDeadline,
    galleryAfterResults: s.galleryAfterResults,
    rules: s.rules,
  }));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const summary = useQuery({ queryKey: ["competition", eventId, "summary"], queryFn: () => CompetitionAdminService.summary(eventId), retry: false });

  const set = <K extends keyof UpdateCompetitionRequest>(k: K, v: UpdateCompetitionRequest[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      onSaved(await CompetitionAdminService.update(eventId, form));
      setDirty(false);
      toast.success("Saved");
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setSaving(false);
    }
  };

  // What is still worth doing before launch, each linked to its page.
  const checklist = [
    { label: "Submission form has questions", done: competition.fields.length > 0, tab: "team-form" },
    { label: "Judging rubric is set", done: competition.criteria.length > 0, tab: "team-rubric" },
    { label: "Submission deadline is set", done: !!s.submissionDeadline, tab: "team-setup" },
    { label: "At least one judge accepted", done: (summary.data?.judges ?? 0) > 0, tab: "team-judges" },
    { label: "Prizes announced", done: competition.awards.length > 0, tab: "team-prizes" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <WorkspaceHeading
        icon={Rocket}
        title={`${s.formatLabel} setup`}
        description={`Now: ${PHASE_LABEL[s.phase]}. Participants form teams and submit on the event's team board; invited judges score blind in their own workspace.`}
      />

      {summary.data && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <WorkspaceStat icon={Users} label="Registered" value={summary.data.registeredParticipants} hint={`${summary.data.participantsInTeams} in teams`} />
          <WorkspaceStat icon={Users} label="Teams" value={summary.data.activeTeams} />
          <WorkspaceStat icon={ClipboardList} label="Submitted" value={summary.data.submittedSubmissions} hint={`${summary.data.draftSubmissions} drafting`} />
          <WorkspaceStat icon={Gavel} label="Judges" value={summary.data.judges} hint="accepted" />
        </div>
      )}

      <WorkspaceRows>
        <WorkspaceRow step={1} title="Launch checklist" description="What is left before participants start.">
          <ul className="flex flex-col divide-y divide-slate-100">
            {checklist.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => onSelectTab?.(item.tab)}
                  className="group flex w-full cursor-pointer items-center justify-between py-2.5 text-left text-xs font-bold text-slate-800"
                >
                  <span className="group-hover:text-[#205ca8]">{item.label}</span>
                  {item.done ? <CheckCircle2 size={16} className="text-emerald-500" /> : <span className="size-4 rounded-full border-2 border-slate-300" />}
                </button>
              </li>
            ))}
          </ul>
        </WorkspaceRow>

        <WorkspaceRow step={2} title="Competition" description="When off, the team board and judging disappear for participants. Nothing is deleted.">
          <WorkspaceChoice
            value={form.enabled ? "on" : "off"}
            onChange={(v) => set("enabled", v === "on")}
            options={[
              { value: "on", label: "On" },
              { value: "off", label: "Off" },
            ]}
          />
        </WorkspaceRow>

        <WorkspaceRow step={3} title="Teams" description="Maximum applies when joining, minimum when submitting. Minimum 1 allows solo entries.">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <WorkspaceLabel>Min size</WorkspaceLabel>
              <input type="number" min={1} max={50} value={form.minTeamSize ?? 1} onChange={(e) => set("minTeamSize", Number(e.target.value))} className={workspaceField.input} />
            </div>
            <div>
              <WorkspaceLabel>Max size</WorkspaceLabel>
              <input type="number" min={1} max={50} value={form.maxTeamSize ?? 4} onChange={(e) => set("maxTeamSize", Number(e.target.value))} className={workspaceField.input} />
            </div>
            <div>
              <WorkspaceLabel>Max teams</WorkspaceLabel>
              <input type="number" min={1} value={form.maxTeams ?? ""} placeholder="No limit" onChange={(e) => set("maxTeams", e.target.value ? Number(e.target.value) : null)} className={workspaceField.input} />
            </div>
          </div>
        </WorkspaceRow>

        <WorkspaceRow step={4} title="Timeline" description="Judges see projects only after submissions close. Leave a date empty to skip that gate.">
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["submissionOpensAt", "Submissions open"],
                ["teamFormationDeadline", "Teams lock"],
                ["submissionDeadline", "Submissions close"],
                ["judgingDeadline", "Judging ends"],
              ] as const
            ).map(([k, label]) => (
              <div key={k}>
                <WorkspaceLabel>{label}</WorkspaceLabel>
                <input type="datetime-local" value={toLocalInput(form[k] as string | null)} onChange={(e) => set(k, fromLocalInput(e.target.value))} className={workspaceField.input} />
              </div>
            ))}
          </div>
        </WorkspaceRow>

        <WorkspaceRow step={5} title="After results" description="Whether every submitted project is shown to participants once you publish results.">
          <WorkspaceChoice
            value={form.galleryAfterResults ? "on" : "off"}
            onChange={(v) => set("galleryAfterResults", v === "on")}
            options={[
              { value: "on", label: "Public project gallery" },
              { value: "off", label: "Leaderboard only" },
            ]}
          />
        </WorkspaceRow>

        <WorkspaceRow step={6} title="Rules" description="Shown on the participants' Brief.">
          <textarea value={form.rules ?? ""} onChange={(e) => set("rules", e.target.value)} className={workspaceField.textarea} placeholder="Eligibility, code of conduct, IP, what may be pre-built…" />
          <WorkspaceSaveBar onSave={save} saving={saving} dirty={dirty} />
        </WorkspaceRow>
      </WorkspaceRows>
    </div>
  );
}

// ───────────────────────── submission form builder ─────────────────────────

const FIELD_TYPES: SubmissionFieldType[] = ["SHORT_TEXT", "LONG_TEXT", "URL", "NUMBER", "EMAIL", "SELECT", "MULTI_SELECT", "CHECKBOX", "FILE"];

/** One-click format groups for a file question; organisers can still type their own extensions. */
const FORMAT_PRESETS: { label: string; formats: string[] }[] = [
  { label: "PDF", formats: ["pdf"] },
  { label: "Slides", formats: ["ppt", "pptx", "key", "odp"] },
  { label: "Documents", formats: ["doc", "docx", "odt", "txt"] },
  { label: "Images", formats: ["png", "jpg", "jpeg", "webp", "gif"] },
  { label: "Video", formats: ["mp4", "mov", "webm"] },
  { label: "Archives", formats: ["zip"] },
];

function FormBuilderPage({ eventId, competition, onChanged }: { eventId: string; competition: Competition; onChanged: () => void }) {
  const fields = competition.fields;
  const [openId, setOpenId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, SubmissionAnswer>>({});
  const [adding, setAdding] = useState(false);

  const move = async (index: number, delta: number) => {
    const ids = fields.map((f) => f.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await CompetitionAdminService.reorderFields(eventId, ids);
      onChanged();
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <WorkspaceHeading
        icon={ClipboardList}
        title="Submission form"
        description="What each team submits. Every project has a title; everything else is up to you. Mark a question organisers-only to keep it from judges and the public gallery."
        actions={
          <button type="button" className={workspaceSecondaryButton} onClick={() => setPreview((p) => !p)}>
            <Eye size={14} /> {preview ? "Back to editing" : "Preview as a team"}
          </button>
        }
      />

      {preview ? (
        <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-surface p-6">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Project name *</p>
          <input className={`${workspaceField.input} mb-6`} placeholder="Every submission has a title" disabled />
          <SubmissionFormFields fields={fields} answers={previewAnswers} onChange={(id, v) => setPreviewAnswers((a) => ({ ...a, [id]: v as SubmissionAnswer }))} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {fields.length === 0 && <p className="py-6 text-center text-xs text-slate-400">No questions yet — teams will only submit a title.</p>}
          {fields.map((f, i) => (
            <FieldCard
              key={f.id}
              eventId={eventId}
              field={f}
              open={openId === f.id}
              onToggle={() => setOpenId(openId === f.id ? null : f.id)}
              onUp={i > 0 ? () => move(i, -1) : undefined}
              onDown={i < fields.length - 1 ? () => move(i, 1) : undefined}
              onChanged={onChanged}
            />
          ))}
          {adding ? (
            <FieldEditor
              title="New question"
              onCancel={() => setAdding(false)}
              onSave={async (body) => {
                await CompetitionAdminService.addField(eventId, body);
                setAdding(false);
                onChanged();
                toast.success("Question added");
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-200 py-5 text-sm font-bold text-slate-500 transition hover:border-[#205ca8] hover:text-[#205ca8]"
            >
              <Plus size={16} /> Add a question
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FieldCard({
  eventId,
  field,
  open,
  onToggle,
  onUp,
  onDown,
  onChanged,
}: {
  eventId: string;
  field: SubmissionField;
  open: boolean;
  onToggle: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onChanged: () => void;
}) {
  if (open) {
    return (
      <FieldEditor
        title="Edit question"
        initial={field}
        onCancel={onToggle}
        onDelete={async () => {
          if (!confirm(`Remove "${field.label}"? Answers already given stop being shown.`)) return;
          await CompetitionAdminService.deleteField(eventId, field.id);
          onChanged();
        }}
        onSave={async (body) => {
          await CompetitionAdminService.updateField(eventId, field.id, body);
          onToggle();
          onChanged();
          toast.success("Question saved");
        }}
      />
    );
  }
  return (
    <div className="group flex items-center gap-3 rounded-3xl border border-slate-200/80 bg-surface px-5 py-4 transition hover:border-slate-300">
      <div className="flex flex-col">
        <button type="button" aria-label="Move up" disabled={!onUp} onClick={onUp} className="cursor-pointer rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30">
          <ArrowUp size={13} />
        </button>
        <button type="button" aria-label="Move down" disabled={!onDown} onClick={onDown} className="cursor-pointer rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30">
          <ArrowDown size={13} />
        </button>
      </div>
      <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 text-left">
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-slate-900">
            {field.label} {field.required && <span className="text-rose-500">*</span>}
          </span>
          {field.helpText && <span className="block truncate text-xs text-slate-500">{field.helpText}</span>}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {field.privateToOrganisers && (
            <CompetitionChip>
              <Lock size={10} /> Organisers only
            </CompetitionChip>
          )}
          <CompetitionChip tone="blue">{FIELD_TYPE_LABEL[field.type]}</CompetitionChip>
          <ChevronDown size={15} className="text-slate-400" />
        </span>
      </button>
    </div>
  );
}

function FieldEditor({
  title,
  initial,
  onSave,
  onCancel,
  onDelete,
}: {
  title: string;
  initial?: SubmissionField;
  onSave: (body: {
    label: string;
    helpText: string | null;
    type: SubmissionFieldType;
    required: boolean;
    options: string[];
    privateToOrganisers: boolean;
    maxFileMb: number | null;
    maxFiles: number | null;
    allowedFormats: string[];
  }) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [helpText, setHelpText] = useState(initial?.helpText ?? "");
  const [type, setType] = useState<SubmissionFieldType>(initial?.type ?? "SHORT_TEXT");
  const [required, setRequired] = useState(initial?.required ?? false);
  const [privateToOrganisers, setPrivate] = useState(initial?.privateToOrganisers ?? false);
  const [options, setOptions] = useState<string[]>(initial?.options?.length ? initial.options : ["", ""]);
  const [maxFileMb, setMaxFileMb] = useState(initial?.maxFileMb ?? 10);
  const [maxFiles, setMaxFiles] = useState(initial?.maxFiles ?? 1);
  const [formats, setFormats] = useState<string[]>(initial?.allowedFormats ?? ["pdf"]);
  const [customFormat, setCustomFormat] = useState("");
  const [saving, setSaving] = useState(false);
  const hasChoices = type === "SELECT" || type === "MULTI_SELECT";
  const isFile = type === "FILE";
  const togglePreset = (preset: string[]) => {
    const all = preset.every((x) => formats.includes(x));
    setFormats((cur) => (all ? cur.filter((x) => !preset.includes(x)) : [...new Set([...cur, ...preset])]));
  };
  const addCustom = () => {
    const ext = customFormat.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (ext && !formats.includes(ext)) setFormats((cur) => [...cur, ext]);
    setCustomFormat("");
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border-2 border-[#205ca8]/40 bg-surface p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#205ca8]">{title}</p>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={160} placeholder="Question, e.g. GitHub repository" className={workspaceField.input} autoFocus />
        <select value={type} onChange={(e) => setType(e.target.value as SubmissionFieldType)} className={workspaceField.select}>
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t}>
              {FIELD_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </div>
      <input value={helpText} onChange={(e) => setHelpText(e.target.value)} maxLength={500} placeholder="Help text shown under the question (optional)" className={workspaceField.input} />
      {hasChoices && (
        <div className="flex flex-col gap-2">
          <WorkspaceLabel>Options</WorkspaceLabel>
          {options.map((o, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={o}
                onChange={(e) => setOptions((all) => all.map((x, j) => (j === i ? e.target.value : x)))}
                placeholder={`Option ${i + 1}`}
                className={workspaceField.input}
              />
              <button type="button" aria-label="Remove option" onClick={() => setOptions((all) => all.filter((_, j) => j !== i))} className="cursor-pointer rounded-full p-2 text-slate-400 hover:text-rose-600">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setOptions((all) => [...all, ""])} className={`${workspaceSecondaryButton} self-start`}>
            <Plus size={13} /> Add option
          </button>
        </div>
      )}
      {isFile && (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <WorkspaceLabel>Max size per file (MB)</WorkspaceLabel>
              <input type="number" min={1} max={100} value={maxFileMb} onChange={(e) => setMaxFileMb(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} className={workspaceField.input} />
            </div>
            <div>
              <WorkspaceLabel>Max number of files</WorkspaceLabel>
              <input type="number" min={1} max={10} value={maxFiles} onChange={(e) => setMaxFiles(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} className={workspaceField.input} />
            </div>
          </div>
          <div>
            <WorkspaceLabel>Allowed formats</WorkspaceLabel>
            <div className="flex flex-wrap gap-1.5">
              {FORMAT_PRESETS.map((p) => {
                const on = p.formats.every((x) => formats.includes(x));
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => togglePreset(p.formats)}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-bold transition ${
                      on ? "border-[#205ca8] bg-blue-50 text-[#205ca8] dark:bg-blue-500/10 dark:text-blue-300" : "border-slate-200 bg-surface text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {formats.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-700">
                  .{f}
                  <button type="button" aria-label={`Remove ${f}`} onClick={() => setFormats((cur) => cur.filter((x) => x !== f))} className="cursor-pointer text-slate-500 hover:text-rose-600">
                    ×
                  </button>
                </span>
              ))}
              <input
                value={customFormat}
                onChange={(e) => setCustomFormat(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                onBlur={addCustom}
                placeholder="+ extension, e.g. fig"
                className="w-36 rounded-full border border-slate-200 bg-surface px-3 py-1 text-[11px] text-slate-700 outline-none focus:border-[#205ca8]"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">{formats.length ? "Only these formats can be uploaded." : "No formats chosen — any file type is accepted."}</p>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-700">
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} className="size-4 accent-[#205ca8]" /> Required
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={privateToOrganisers} onChange={(e) => setPrivate(e.target.checked)} className="size-4 accent-[#205ca8]" />
          <Lock size={12} /> Organisers only (hidden from judges)
        </label>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
        {onDelete ? (
          <button type="button" onClick={onDelete} className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-rose-600 hover:underline">
            <Trash2 size={13} /> Remove question
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button type="button" className={workspaceSecondaryButton} onClick={onCancel}>
            Cancel
          </button>
          <WorkspacePrimaryButton
            disabled={saving || !label.trim() || (hasChoices && options.filter((o) => o.trim()).length < 2)}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave({
                  label: label.trim(),
                  helpText: helpText.trim() || null,
                  type,
                  required,
                  options: hasChoices ? options.map((o) => o.trim()).filter(Boolean) : [],
                  privateToOrganisers,
                  maxFileMb: isFile ? maxFileMb : null,
                  maxFiles: isFile ? maxFiles : null,
                  allowedFormats: isFile ? formats : [],
                });
              } catch (e) {
                toast.error(errorText(e));
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving…" : "Save question"}
          </WorkspacePrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── tracks ─────────────────────────

function TracksPage({ eventId, competition, onChanged }: { eventId: string; competition: Competition; onChanged: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const add = async () => {
    try {
      await CompetitionAdminService.addTrack(eventId, { name, description: description || null });
      setName("");
      setDescription("");
      onChanged();
    } catch (e) {
      toast.error(errorText(e));
    }
  };
  return (
    <div className="flex flex-col gap-8">
      <WorkspaceHeading icon={Lightbulb} title="Tracks" description="Themes or problem statements. Teams pick one; prizes and judges can be limited to one." />
      <div className="grid gap-3 sm:grid-cols-2">
        {competition.tracks.map((t) => (
          <div key={t.id} className="flex items-start justify-between gap-3 rounded-3xl border border-violet-200/70 bg-violet-50/40 p-5 dark:border-violet-500/25 dark:bg-violet-500/5">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900">{t.name}</p>
              {t.description && <p className="mt-1 whitespace-pre-line text-xs text-slate-600">{t.description}</p>}
            </div>
            <DeleteButton onClick={async () => { await CompetitionAdminService.deleteTrack(eventId, t.id).catch((e) => toast.error(errorText(e))); onChanged(); }} />
          </div>
        ))}
        {competition.tracks.length === 0 && <p className="text-xs text-slate-400 sm:col-span-2">No tracks — every team competes in one open category.</p>}
      </div>
      <div className="flex flex-col gap-2 rounded-3xl border border-slate-200/80 p-5">
        <WorkspaceLabel>New track</WorkspaceLabel>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Track name, e.g. Sustainability" className={workspaceField.input} maxLength={120} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Problem statement (optional)" className={`${workspaceField.textarea} min-h-[90px]`} />
        <button type="button" className={`${workspaceSecondaryButton} self-end`} disabled={!name.trim()} onClick={add}>
          <Plus size={14} /> Add track
        </button>
      </div>
    </div>
  );
}

// ───────────────────────── rubric ─────────────────────────

function RubricPage({ eventId, competition, onChanged }: { eventId: string; competition: Competition; onChanged: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState(1);
  const [max, setMax] = useState(10);
  const totalWeight = competition.criteria.reduce((n, c) => n + c.weight, 0) || 1;
  return (
    <div className="flex flex-col gap-8">
      <WorkspaceHeading
        icon={Scale}
        title="Judging rubric"
        description="Each criterion counts by its weight; a project's score is normalised to 100. Weights and maxima lock once any judge saves a scorecard."
      />
      <ul className="flex flex-col gap-3">
        {competition.criteria.map((c) => {
          const pct = Math.round((c.weight / totalWeight) * 100);
          return (
            <li key={c.id} className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-surface px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-bold text-slate-900">{c.name}</p>
                  <span className="text-xs font-bold text-slate-500">
                    {pct}% · out of {c.maxScore}
                  </span>
                </div>
                {c.description && <p className="text-xs text-slate-500">{c.description}</p>}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <DeleteButton onClick={async () => { await CompetitionAdminService.deleteCriterion(eventId, c.id).catch((e) => toast.error(errorText(e))); onChanged(); }} />
            </li>
          );
        })}
      </ul>
      <div className="grid gap-2 rounded-3xl border border-slate-200/80 p-5 sm:grid-cols-[2fr_2fr_90px_90px_auto] sm:items-end">
        <div>
          <WorkspaceLabel>Criterion</WorkspaceLabel>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Innovation" className={workspaceField.input} />
        </div>
        <div>
          <WorkspaceLabel>What judges look for</WorkspaceLabel>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" className={workspaceField.input} />
        </div>
        <div>
          <WorkspaceLabel>Weight</WorkspaceLabel>
          <input type="number" min={1} max={100} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className={workspaceField.input} />
        </div>
        <div>
          <WorkspaceLabel>Out of</WorkspaceLabel>
          <input type="number" min={1} max={100} value={max} onChange={(e) => setMax(Number(e.target.value))} className={workspaceField.input} />
        </div>
        <button
          type="button"
          className={workspaceSecondaryButton}
          disabled={!name.trim()}
          onClick={async () => {
            try {
              await CompetitionAdminService.addCriterion(eventId, { name, description: description || null, weight, maxScore: max });
              setName("");
              setDescription("");
              onChanged();
            } catch (e) {
              toast.error(errorText(e));
            }
          }}
        >
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}

// ───────────────────────── prizes ─────────────────────────

function PrizesPage({ eventId, competition, onChanged }: { eventId: string; competition: Competition; onChanged: () => void }) {
  const [name, setName] = useState("");
  const [prize, setPrize] = useState("");
  const [trackId, setTrackId] = useState("");
  return (
    <div className="flex flex-col gap-8">
      <WorkspaceHeading icon={Trophy} title="Prizes" description="Shown on the Brief. You pick each winner on Leaderboard & results; winners stay hidden until you publish." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {competition.awards.map((a, i) => (
          <div
            key={a.id}
            className="relative flex flex-col gap-1 rounded-3xl border border-amber-200/70 p-5 dark:border-amber-500/25"
            style={{ background: i === 0 ? "linear-gradient(135deg, rgba(251,191,36,0.16), rgba(251,191,36,0.02))" : undefined }}
          >
            <div className="absolute right-3 top-3">
              <DeleteButton onClick={async () => { await CompetitionAdminService.deleteAward(eventId, a.id).catch((e) => toast.error(errorText(e))); onChanged(); }} />
            </div>
            <Trophy size={18} className="text-amber-500" />
            <p className="text-sm font-extrabold text-slate-900">{a.name}</p>
            {a.prize && <p className="text-lg font-black text-amber-600 dark:text-amber-300">{a.prize}</p>}
            {a.trackId && <p className="text-[11px] font-bold text-violet-600">{competition.tracks.find((t) => t.id === a.trackId)?.name} track</p>}
            {a.teamName && <p className="text-xs font-bold text-emerald-600">Winner: {a.teamName}</p>}
          </div>
        ))}
      </div>
      <div className="grid gap-2 rounded-3xl border border-slate-200/80 p-5 sm:grid-cols-[2fr_2fr_1.5fr_auto] sm:items-end">
        <div>
          <WorkspaceLabel>Award</WorkspaceLabel>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grand prize" className={workspaceField.input} />
        </div>
        <div>
          <WorkspaceLabel>Prize</WorkspaceLabel>
          <input value={prize} onChange={(e) => setPrize(e.target.value)} placeholder="e.g. ₹50,000 + internships" className={workspaceField.input} />
        </div>
        <div>
          <WorkspaceLabel>Track</WorkspaceLabel>
          <select value={trackId} onChange={(e) => setTrackId(e.target.value)} className={workspaceField.select}>
            <option value="">Any track</option>
            {competition.tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className={workspaceSecondaryButton}
          disabled={!name.trim()}
          onClick={async () => {
            try {
              await CompetitionAdminService.addAward(eventId, { name, prize: prize || null, trackId: trackId || null });
              setName("");
              setPrize("");
              onChanged();
            } catch (e) {
              toast.error(errorText(e));
            }
          }}
        >
          <Plus size={14} /> Add prize
        </button>
      </div>
    </div>
  );
}

// ───────────────────────── judges ─────────────────────────

const JUDGE_STATUS: Record<CompetitionJudge["status"], { label: string; tone: "amber" | "green" | "red"; icon: typeof Clock3 }> = {
  INVITED: { label: "Invited — waiting", tone: "amber", icon: Clock3 },
  ACCEPTED: { label: "Accepted", tone: "green", icon: CheckCircle2 },
  DECLINED: { label: "Declined", tone: "red", icon: XCircle },
};

function JudgesPage({ eventId, competition }: { eventId: string; competition: Competition }) {
  const queryClient = useQueryClient();
  const key = ["competition", eventId, "judges"];
  const judges = useQuery({ queryKey: key, queryFn: () => CompetitionAdminService.judges(eventId), retry: false });
  const [identifier, setIdentifier] = useState("");
  const [trackId, setTrackId] = useState("");
  const [busy, setBusy] = useState(false);

  const invite = async (who: string, track: string | null) => {
    setBusy(true);
    try {
      queryClient.setQueryData(key, await CompetitionAdminService.inviteJudge(eventId, who, track));
      setIdentifier("");
      toast.success("Invitation sent — they'll be a judge once they accept");
    } catch (err) {
      toast.error(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <WorkspaceHeading
        icon={Gavel}
        title="Judges"
        description="Invite judges by email or @username — even people without an Arcade account. They get a notification and an email, and only judges who accept can score. Judging is blind: judges see projects, never teams."
      />
      <form
        className="grid gap-2 rounded-3xl border border-slate-200/80 p-5 sm:grid-cols-[2fr_1.5fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          void invite(identifier, trackId || null);
        }}
      >
        <div>
          <WorkspaceLabel>Email or @username</WorkspaceLabel>
          <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="judge@company.com" className={workspaceField.input} />
        </div>
        <div>
          <WorkspaceLabel>Judges</WorkspaceLabel>
          <select value={trackId} onChange={(e) => setTrackId(e.target.value)} className={workspaceField.select}>
            <option value="">Every track</option>
            {competition.tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} only
              </option>
            ))}
          </select>
        </div>
        <WorkspacePrimaryButton type="submit" disabled={busy || !identifier.trim()} icon={<Mail size={15} />}>
          {busy ? "Sending…" : "Send invite"}
        </WorkspacePrimaryButton>
      </form>

      {judges.isLoading ? (
        <WorkspaceLoading />
      ) : (judges.data ?? []).length === 0 ? (
        <p className="text-center text-xs text-slate-400">No judges invited yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-100 rounded-3xl border border-slate-200/80 bg-surface">
          {(judges.data ?? []).map((j) => {
            const st = JUDGE_STATUS[j.status];
            return (
              <li key={j.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    {j.person ? <Gavel size={16} /> : <Mail size={16} />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{j.person?.name ?? j.invitedEmail}</p>
                    <p className="truncate text-xs text-slate-500">
                      {j.person ? j.person.email ?? (j.person.username && `@${j.person.username}`) : "No account yet — invited by email"}
                      {j.trackName ? ` · ${j.trackName} only` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CompetitionChip tone={st.tone}>
                    <st.icon size={11} /> {st.label}
                  </CompetitionChip>
                  {j.status === "ACCEPTED" && <span className="text-xs font-bold text-slate-500">{j.finalized}/{j.assigned} scored</span>}
                  {j.status === "DECLINED" && (
                    <button
                      type="button"
                      className={workspaceSecondaryButton}
                      onClick={() => invite(j.person?.email ?? j.invitedEmail ?? (j.person?.username ? `@${j.person.username}` : ""), j.trackId)}
                    >
                      <RotateCcw size={13} /> Invite again
                    </button>
                  )}
                  <DeleteButton
                    onClick={async () => {
                      if (!confirm(j.status === "ACCEPTED" ? `Remove ${j.person?.name}? Their scorecards are deleted too.` : "Withdraw this invitation?")) return;
                      await CompetitionAdminService.removeJudge(eventId, j.id).catch((e) => toast.error(errorText(e)));
                      queryClient.invalidateQueries({ queryKey: key });
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Remove" className="cursor-pointer rounded-full p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10">
      <Trash2 size={14} />
    </button>
  );
}
