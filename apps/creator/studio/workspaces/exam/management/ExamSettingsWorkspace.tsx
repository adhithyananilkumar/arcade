"use client";

import { withReturnTo } from "@/infrastructure/state/navigationHistory";
import { usePublicCategories } from "@/shared/hooks/usePublicCategories";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Calendar, Check, ClipboardList, ExternalLink, Link2, Loader2, Pencil, Unlink } from "lucide-react";
import { toast } from "sonner";
import {
  listTieCandidates,
  tieExam,
  untieExam,
  updateExam,
  type ExamResponse,
  type ExamTieType,
} from "@/domains/assessments";
import { SchedulePanel } from "@/domains/publishing";
import { BadgeTierPanel } from "../../../credentials/BadgeTierPanel";
import { formatMoney } from "@/shared/utils/money";
import {
  WorkspaceRow,
  WorkspaceRows,
  WorkspaceSaveBar,
  workspaceField,
  workspaceSecondaryButton,
} from "../../../core/StudioWorkspaceKit";

/** The exam editor (question bank). */
const questionBankHref = (examId: string) =>
  withReturnTo(`/studio/exam/${examId}/edit`, `/studio/content/exam/${examId}?tab=settings`);

const fillButton =
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-ink px-6 py-3 text-xs font-extrabold text-on-ink shadow-md transition-all hover:bg-[#205ca8] disabled:cursor-not-allowed disabled:opacity-40";

/**
 * An exam's Overview tab: what the examination is called and how it is described, plus the way
 * into its question bank. The exam's counterpart of the course's Overview & Outcomes tab.
 */
export function ExamAboutWorkspace({
  exam,
  onChange,
  readOnly,
}: {
  exam: ExamResponse;
  onChange: (exam: ExamResponse) => void;
  readOnly?: boolean;
}) {
  const [title, setTitle] = useState(exam.title);
  const [description, setDescription] = useState(exam.description ?? "");
  const [purpose, setPurpose] = useState(exam.purpose ?? "");
  const [saving, setSaving] = useState(false);

  const dirty = title !== exam.title || description !== (exam.description ?? "") || purpose !== (exam.purpose ?? "");

  const save = async () => {
    if (!title.trim()) {
      toast.error("An exam needs a title");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateExam(exam.id, {
        title: title.trim(),
        description: description.trim(),
        purpose: purpose.trim(),
      });
      onChange(updated);
      toast.success("Exam overview saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the overview");
    } finally {
      setSaving(false);
    }
  };

  const questionBankRow = (
    <WorkspaceRow
      step={1}
      title="Question bank"
      description="Write and organise this exam's questions in Studio. Every plan draws from this bank."
    >
      <div>
        <Link
          href={questionBankHref(exam.id)}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
        >
          <Pencil size={14} /> Edit question bank
        </Link>
      </div>
    </WorkspaceRow>
  );

  // A linked exam is named and described by its course or event (the server refuses edits to
  // these fields), so it shows what it inherited and where to change it — no form.
  if (exam.tieType) {
    const noun = exam.tieType === "COURSE" ? "course" : "event";
    const parentHref = exam.tiedContentId ? `/studio/content/${noun}/${exam.tiedContentId}` : null;
    return (
      <WorkspaceRows>
        {questionBankRow}
        <WorkspaceRow
          step={2}
          title="Name & description"
          description={`Set automatically from the ${noun} this exam belongs to. Rename the ${noun} and its exam follows.`}
          aside={
            parentHref && (
              <Link href={parentHref} className="text-xs font-bold text-[#205ca8] hover:underline dark:text-blue-400">
                Open the {noun} →
              </Link>
            )
          }
        >
          <dl className="flex flex-col gap-4">
            <div>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Title</dt>
              <dd className="mt-1 text-sm font-bold text-ink">{exam.title}</dd>
            </div>
            {exam.purpose && (
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Purpose</dt>
                <dd className="mt-1 text-sm font-medium text-slate-600">{exam.purpose}</dd>
              </div>
            )}
            {exam.description && (
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-600">{exam.description}</dd>
              </div>
            )}
          </dl>
        </WorkspaceRow>
      </WorkspaceRows>
    );
  }

  return (
    <WorkspaceRows>
      {questionBankRow}

      <WorkspaceRow step={2} title="Exam title" description="How the examination is named wherever it appears.">
        <input id="exam-title" value={title} disabled={readOnly} onChange={(e) => setTitle(e.target.value)} className={workspaceField.input} />
      </WorkspaceRow>

      <WorkspaceRow step={3} title="About this exam" description="Shown to candidates before they start.">
        <textarea
          id="exam-description"
          value={description}
          disabled={readOnly}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What the exam covers, what to bring, how it is marked…"
          className={workspaceField.textarea}
        />
      </WorkspaceRow>

      <WorkspaceRow
        step={4}
        title="Purpose"
        description="A label for your own reference. Nothing in the platform behaves differently because of what you write here."
      >
        <input
          id="exam-purpose"
          value={purpose}
          disabled={readOnly}
          placeholder="e.g. Entrance test, Final assessment"
          onChange={(e) => setPurpose(e.target.value)}
          className={workspaceField.input}
        />
      </WorkspaceRow>

      {!readOnly && <WorkspaceSaveBar onSave={save} saving={saving} dirty={dirty} label="Save overview" savedLabel="Overview saved" />}
    </WorkspaceRows>
  );
}

/**
 * Exam settings — where the examination sits and how it is offered, not how it is sat.
 *
 * <p>Duration, attempts, pass mark, proctoring and delivery belong to a <em>plan</em>, because the
 * same exam can be practised loosely and sat under supervision; the last row says so and links
 * there. What lives here is true of the examination however it is run.
 */
export function ExamSettingsWorkspace({
  exam,
  onChange,
  readOnly,
  onOpenPlans,
}: {
  exam: ExamResponse;
  onChange: (exam: ExamResponse) => void;
  readOnly?: boolean;
  onOpenPlans?: () => void;
}) {
  const noun = exam.tieType === "COURSE" ? "course" : "event";
  const placement =
    exam.tieType && exam.tiedContentId
      ? {
          label: exam.tiedContentTitle ?? (exam.tieType === "COURSE" ? "Course" : "Event"),
          href: `/studio/content/${exam.tieType === "COURSE" ? "course" : "event"}/${exam.tiedContentId}`,
          icon: exam.tieType === "COURSE" ? BookOpen : Calendar,
        }
      : null;
  // Numbering follows the rows actually shown (the badge row is standalone-only).
  const steps = ["placement", "fee", "category", "schedule", ...(exam.tieType ? [] : ["badge"]), "conduct"];
  const n = (key: string) => steps.indexOf(key) + 1;

  return (
    <WorkspaceRows>
      <WorkspaceRow
        step={n("placement")}
        title="Placement"
        description={
          placement
            ? `This exam is the assessment system of its ${noun}: its completion and assessment plans live inside it, a certification plan requires completing it, and it is reviewed and published with the ${noun}.`
            : "Standalone — learners find this exam in Explore > Exams and register for it. Tie it to one of your courses or events to make it that content's assessment system instead. A course or event can have only one exam."
        }
      >
        {placement ? (
          <div className="flex flex-wrap items-center gap-2">
            <Link href={placement.href} className={workspaceSecondaryButton}>
              <placement.icon size={14} className="text-slate-400" />
              {placement.label}
              <ExternalLink size={12} className="text-slate-300" />
            </Link>
            {!readOnly && <UntieButton exam={exam} onChange={onChange} />}
          </div>
        ) : readOnly ? (
          <p className="text-sm font-bold text-ink">Standalone</p>
        ) : (
          <TiePicker exam={exam} onChange={onChange} />
        )}
      </WorkspaceRow>

      <WorkspaceRow
        step={n("fee")}
        title="Registration fee"
        description={
          exam.tieType
            ? `Set by the platform's exam standard for a tied exam. Assessments inside the ${noun} are included with enrolment.`
            : "What learners pay to register in Explore > Exams. Leave empty for free."
        }
      >
        <PricingSection exam={exam} onChange={onChange} readOnly={readOnly} />
      </WorkspaceRow>

      <WorkspaceRow step={n("category")} title="Category" description="Where learners find this exam in Explore > Exams.">
        <CategorySection exam={exam} onChange={onChange} readOnly={readOnly} />
      </WorkspaceRow>

      <WorkspaceRow
        step={n("schedule")}
        title="Schedule"
        description={
          exam.tieType
            ? `Assessments inside the ${noun} follow its schedule. This applies only to the exam's certification: when learners can register for it in Explore > Exams, and when it can be sat.`
            : "When learners can register for this exam, and when it can be sat."
        }
        wide
      >
        <SchedulePanel contentType="EXAM" contentId={exam.id} readOnly={readOnly} bare />
      </WorkspaceRow>

      {/* A tied exam completes its course or event, and that content's badge is the one earned. */}
      {!exam.tieType && (
        <WorkspaceRow step={n("badge")} title="Completion badge" description="The recognition candidates receive for passing this exam." wide>
          <BadgeTierPanel contentType="EXAM" contentId={exam.id} readOnly={readOnly} bare />
        </WorkspaceRow>
      )}

      <WorkspaceRow
        step={n("conduct")}
        title="Conducting this exam"
        description="Duration, attempts, pass mark and security are set on each exam plan, within the platform's standard for its type."
      >
        {onOpenPlans && (
          <div>
            <button type="button" onClick={onOpenPlans} className={workspaceSecondaryButton}>
              <ClipboardList size={14} /> Open exam plans
            </button>
          </div>
        )}
      </WorkspaceRow>
    </WorkspaceRows>
  );
}

function TiePicker({ exam, onChange }: { exam: ExamResponse; onChange: (exam: ExamResponse) => void }) {
  const [type, setType] = useState<ExamTieType>("COURSE");
  const [options, setOptions] = useState<Array<{ id: string; title: string; status: string }> | null>(null);
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listTieCandidates(type)
      .then((list) => !cancelled && setOptions(list))
      .catch(() => !cancelled && setOptions([]));
    return () => {
      cancelled = true;
    };
  }, [type]);

  const tie = async () => {
    if (!target) return;
    const title = options?.find((o) => o.id === target)?.title ?? "it";
    if (!window.confirm(`Tie "${exam.title}" to ${title}? The platform's locked standards will apply to its plans.`)) return;
    setBusy(true);
    try {
      onChange(await tieExam(exam.id, type === "COURSE" ? { courseId: target } : { eventId: target }));
      toast.success(`Tied to ${title}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't tie this exam");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row">
      <select
        value={type}
        aria-label="Content type"
        onChange={(e) => {
          setOptions(null);
          setTarget("");
          setType(e.target.value as ExamTieType);
        }}
        className={`${workspaceField.select} sm:w-36`}
      >
        <option value="COURSE">Course</option>
        <option value="EVENT">Event</option>
      </select>
      <select
        value={target}
        aria-label={`Choose a ${type.toLowerCase()}`}
        onChange={(e) => setTarget(e.target.value)}
        disabled={!options || options.length === 0}
        className={`${workspaceField.select} min-w-0 flex-1`}
      >
        <option value="">
          {options === null ? "Loading…" : options.length === 0 ? `You have no ${type.toLowerCase()}s` : `Choose a ${type.toLowerCase()}`}
        </option>
        {options?.map((o) => (
          <option key={o.id} value={o.id}>
            {o.title}
          </option>
        ))}
      </select>
      <button type="button" onClick={tie} disabled={!target || busy} className={fillButton}>
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />} Tie
      </button>
    </div>
  );
}

function UntieButton({ exam, onChange }: { exam: ExamResponse; onChange: (exam: ExamResponse) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (
          !window.confirm(
            `Make "${exam.title}" standalone? Its assessments are removed from ${exam.tiedContentTitle ?? "the content"}, and a completion plan can no longer complete it.`
          )
        )
          return;
        setBusy(true);
        try {
          onChange(await untieExam(exam.id));
          toast.success("The exam is standalone now");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Couldn't untie this exam");
        } finally {
          setBusy(false);
        }
      }}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200/90 bg-surface px-5 py-2.5 text-xs font-bold text-slate-600 shadow-2xs hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
    >
      {busy ? <Loader2 size={13} className="animate-spin" /> : <Unlink size={13} />} Untie
    </button>
  );
}

/**
 * Where the exam is shelved in Explore > Exams. The categories are the super-user-managed ones
 * scoped to exams (type EXAMS, or ALL); none picked is "Other". Saves on change.
 */
function CategorySection({
  exam,
  onChange,
  readOnly,
}: {
  exam: ExamResponse;
  onChange: (exam: ExamResponse) => void;
  readOnly?: boolean;
}) {
  const publicCategories = usePublicCategories();
  const categories = useMemo(() => publicCategories.filter((c) => c.type === "EXAMS" || c.type === "ALL"), [publicCategories]);
  const [saving, setSaving] = useState(false);

  const save = async (categoryId: string) => {
    setSaving(true);
    try {
      onChange(await updateExam(exam.id, { categoryId }));
      toast.success("Category saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      value={exam.categoryId ?? ""}
      disabled={readOnly || saving}
      onChange={(e) => save(e.target.value)}
      aria-label="Category"
      className={workspaceField.select}
    >
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
      <option value="">Other</option>
    </select>
  );
}

function PricingSection({
  exam,
  onChange,
  readOnly,
}: {
  exam: ExamResponse;
  onChange: (exam: ExamResponse) => void;
  readOnly?: boolean;
}) {
  const currency = exam.currency ?? "INR";
  const [price, setPrice] = useState(exam.priceAmountMinor ? String(exam.priceAmountMinor / 100) : "");
  const [saving, setSaving] = useState(false);
  const current = exam.priceAmountMinor ? String(exam.priceAmountMinor / 100) : "";

  const save = async () => {
    const major = price.trim() === "" ? 0 : Number(price);
    if (!Number.isFinite(major) || major < 0) {
      toast.error("Enter a valid price");
      return;
    }
    setSaving(true);
    try {
      onChange(await updateExam(exam.id, { priceAmountMinor: Math.round(major * 100), currency }));
      toast.success("Price saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the price");
    } finally {
      setSaving(false);
    }
  };

  if (exam.tieType) {
    return <p className="text-sm font-bold text-ink">{exam.registrationFeeMinor > 0 ? formatMoney(exam.registrationFeeMinor, currency) : "Free"}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex flex-1 items-center">
          <span className="pointer-events-none absolute left-4 text-sm font-bold text-slate-400">{currency === "INR" ? "₹" : currency}</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            disabled={readOnly}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Free"
            aria-label="Registration fee"
            className={workspaceField.inputWithIcon}
          />
        </div>
        {!readOnly && (
          <button type="button" onClick={save} disabled={saving || price === current} className={fillButton}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save fee
          </button>
        )}
      </div>
      {exam.registrationFeeMinor !== (exam.priceAmountMinor ?? 0) && (
        <p className="px-1 text-[11px] font-medium text-slate-500">
          The platform standard currently makes it {formatMoney(exam.registrationFeeMinor, currency)}.
        </p>
      )}
    </div>
  );
}
