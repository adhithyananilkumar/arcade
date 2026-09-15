"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Calendar, Check, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateExam, type ExamResponse } from "@/domains/assessments";

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

  const placement = exam.courseId
    ? { label: "Attached to a course", href: `/studio/content/course/${exam.courseId}`, icon: BookOpen }
    : exam.eventId
      ? { label: "Attached to an event", href: `/studio/content/event/${exam.eventId}`, icon: Calendar }
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
        <h3 className="text-sm font-black tracking-tight text-[#14142b]">Where this exam lives</h3>
        {placement ? (
          <>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              This exam belongs to its parent content and is reached through it, rather than
              appearing on its own in the content list.
            </p>
            <Link
              href={placement.href}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#14142b] transition-colors hover:bg-slate-50"
            >
              <placement.icon size={14} className="text-slate-400" />
              {placement.label}
              <ExternalLink size={12} className="text-slate-300" />
            </Link>
          </>
        ) : (
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Standalone — this exam appears as its own content item and can be offered on its own.
            Adding it to a course or event from that content&apos;s editor attaches it instead; the
            exam itself is never duplicated.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-white/50 bg-white/50 p-5 shadow-sm backdrop-blur-md">
        <h3 className="text-sm font-black tracking-tight text-[#14142b]">Conducting this exam</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Duration, attempts, pass mark, delivery, security and completion behaviour are set on each{" "}
          <strong className="font-bold text-[#14142b]">exam plan</strong>, not here — one exam can
          be offered several ways over the same questions. Open the Plans workspace to configure
          them.
        </p>
      </section>
    </div>
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
