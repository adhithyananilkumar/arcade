"use client";

import { usePublicCategories } from "@/shared/hooks/usePublicCategories";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Calendar, Check, ExternalLink, Link2, Loader2, Unlink } from "lucide-react";
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
import { formatMoney } from "@/shared/utils/money";

/**
 * Exam Content settings — the examination itself, not how it is offered.
 *
 * <p>This split is the one thing this screen has to teach. Duration, attempts, pass mark,
 * proctoring and delivery all belong to a <em>plan</em>, because the same exam can be practised
 * loosely and sat under supervision. What lives here is what is true of the examination however it
 * is run: what it is called, what it is for, and where it sits in the platform.
 *
 * <p>The previous settings screen mixed the two, which is why it read as a pile of fields — a
 * creator could not tell which of them a second plan would override.
 */
export function ExamSettingsWorkspace({
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

  const dirty =
    title !== exam.title ||
    description !== (exam.description ?? "") ||
    purpose !== (exam.purpose ?? "");

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
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save these settings");
    } finally {
      setSaving(false);
    }
  };

  const placement =
    exam.tieType && exam.tiedContentId
      ? {
          label: exam.tiedContentTitle ?? (exam.tieType === "COURSE" ? "Course" : "Event"),
          href: `/studio/content/${exam.tieType === "COURSE" ? "course" : "event"}/${exam.tiedContentId}`,
          icon: exam.tieType === "COURSE" ? BookOpen : Calendar,
        }
      : null;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-md">
        <h3 className="text-sm font-black tracking-tight text-[#14142b]">About this exam</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          How the examination is described wherever it appears.
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <Field label="Title" htmlFor="exam-title">
            <input
              id="exam-title"
              value={title}
              disabled={readOnly}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#14142b] outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />
          </Field>

          <Field
            label="Description"
            htmlFor="exam-description"
            hint="Shown to candidates before they start."
          >
            <textarea
              id="exam-description"
              rows={3}
              value={description}
              disabled={readOnly}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#14142b] outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />
          </Field>

          <Field
            label="Purpose"
            htmlFor="exam-purpose"
            hint="A label for your own reference — describe it however fits. Nothing in the platform behaves differently because of what you write here."
          >
            <input
              id="exam-purpose"
              value={purpose}
              disabled={readOnly}
              placeholder="e.g. Entrance test, Final assessment"
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#14142b] outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />
          </Field>
        </div>

        {!readOnly && (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#14142b] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-black disabled:opacity-40"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {dirty ? "Save changes" : "Saved"}
            </button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-md">
        <h3 className="text-sm font-black tracking-tight text-[#14142b]">Tied content</h3>
        {placement ? (
          <>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              This exam is the assessment system of its {exam.tieType === "COURSE" ? "course" : "event"}. Its
              completion and assessment plans live inside it, a certification plan requires completing it,
              and the platform&apos;s locked exam standards apply to every plan. It is reviewed and published
              with the {exam.tieType === "COURSE" ? "course" : "event"}.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href={placement.href}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#14142b] transition-colors hover:bg-slate-50"
              >
                <placement.icon size={14} className="text-slate-400" />
                {placement.label}
                <ExternalLink size={12} className="text-slate-300" />
              </Link>
              {!readOnly && <UntieButton exam={exam} onChange={onChange} />}
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Standalone — learners find this exam in Explore &gt; Exams and register for it. Tie it to one
              of your courses or events to make it that content&apos;s assessment system instead. A course
              or event can have only one exam.
            </p>
            {!readOnly && <TiePicker exam={exam} onChange={onChange} />}
          </>
        )}
      </section>

      <PricingSection exam={exam} onChange={onChange} readOnly={readOnly} />
      <CategorySection exam={exam} onChange={onChange} readOnly={readOnly} />

      {!exam.tieType && <SchedulePanel contentType="EXAM" contentId={exam.id} readOnly={readOnly} />}
      {exam.tieType && (
        <section className="rounded-2xl border border-white/50 bg-white/50 p-5 shadow-sm backdrop-blur-md">
          <h3 className="text-sm font-black tracking-tight text-[#14142b]">Schedule</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Assessments inside the {exam.tieType === "COURSE" ? "course" : "event"} follow its schedule. The
            schedule below applies only to this exam&apos;s certification: when learners can register for it
            in Explore &gt; Exams, and when it can be sat.
          </p>
          <div className="mt-3">
            <SchedulePanel contentType="EXAM" contentId={exam.id} readOnly={readOnly} />
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-white/50 bg-white/50 p-5 shadow-sm backdrop-blur-md">
        <h3 className="text-sm font-black tracking-tight text-[#14142b]">Conducting this exam</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Duration, attempts, pass mark and security are set on each{" "}
          <strong className="font-bold text-[#14142b]">exam plan</strong>, within the platform&apos;s
          standard for its type. Open the Plans tab to configure them.
        </p>
      </section>
    </div>
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
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <select
        value={type}
        onChange={(e) => {
          setOptions(null);
          setTarget("");
          setType(e.target.value as ExamTieType);
        }}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#14142b]"
      >
        <option value="COURSE">Course</option>
        <option value="EVENT">Event</option>
      </select>
      <select
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        disabled={!options || options.length === 0}
        className="min-w-[220px] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#14142b] disabled:bg-slate-50"
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
      <button
        type="button"
        onClick={tie}
        disabled={!target || busy}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#14142b] px-4 py-2 text-xs font-bold text-white hover:bg-black disabled:opacity-40"
      >
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
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
    >
      {busy ? <Loader2 size={13} className="animate-spin" /> : <Unlink size={13} />} Untie
    </button>
  );
}

/**
 * Where the exam is shelved in Explore > Exams. The categories are the super-user-managed ones
 * scoped to exams (type EXAMS, or ALL); none picked is "Other".
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
  const categories = useMemo(
    () => publicCategories.filter((c) => c.type === "EXAMS" || c.type === "ALL"),
    [publicCategories]
  );
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
    <section className="rounded-2xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-md">
      <h3 className="text-sm font-black tracking-tight text-[#14142b]">Category</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Where learners find this exam in Explore &gt; Exams.
      </p>
      <select
        value={exam.categoryId ?? ""}
        disabled={readOnly || saving}
        onChange={(e) => save(e.target.value)}
        className="mt-3 w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#14142b] outline-none focus:border-indigo-300 disabled:bg-slate-50"
      >
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
        <option value="">Other</option>
      </select>
    </section>
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

  return (
    <section className="rounded-2xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-md">
      <h3 className="text-sm font-black tracking-tight text-[#14142b]">Registration fee</h3>
      {exam.tieType ? (
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          The certification fee for a tied exam is set by the platform&apos;s exam standard:{" "}
          <b className="text-[#14142b]">
            {exam.registrationFeeMinor > 0 ? formatMoney(exam.registrationFeeMinor, currency) : "free"}
          </b>
          . Assessments inside the {exam.tieType === "COURSE" ? "course" : "event"} are included with enrolment.
        </p>
      ) : (
        <>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            What learners pay to register for this exam in Explore &gt; Exams. Leave empty for free.
            {exam.registrationFeeMinor !== (exam.priceAmountMinor ?? 0) &&
              ` The platform standard currently makes it ${formatMoney(exam.registrationFeeMinor, currency)}.`}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">{currency}</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              disabled={readOnly}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Free"
              className="w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#14142b] outline-none focus:border-indigo-300 disabled:bg-slate-50"
            />
            {!readOnly && (
              <button
                type="button"
                onClick={save}
                disabled={saving || price === current}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#14142b] px-4 py-2 text-xs font-bold text-white hover:bg-black disabled:opacity-40"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{hint}</p>}
    </div>
  );
}
