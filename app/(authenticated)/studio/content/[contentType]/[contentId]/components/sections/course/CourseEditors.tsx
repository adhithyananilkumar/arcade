"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Clock, Link as LinkIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/infrastructure/http/api";
import { uploadFileToStorage } from "@/infrastructure/media/upload";
import { parsePreviewMedia } from "@/apps/learner/components/content-overview/sections/OverviewVideoPlayer";
import { usePublicCategories } from "@/shared/hooks/usePublicCategories";
import type { CourseResponse } from "@/shared/types/api.types";
import { formatMoney, fromMinorUnits, toMinorUnits } from "@/shared/utils/money";
import { SchedulePanel } from "@/domains/publishing";
import { BadgeTierPanel } from "@/apps/creator/studio/credentials/BadgeTierPanel";
import {
  WorkspaceChoice,
  WorkspaceLabel,
  WorkspaceLoading,
  WorkspaceMessage,
  WorkspaceRow,
  WorkspaceRows,
  WorkspaceSaveBar,
  workspaceField,
} from "@/apps/creator/studio/core/StudioWorkspaceKit";
import type { CollaboratorLite } from "../../../lib/fetchOverviewData";
import { CollaboratorsSection } from "../CollaboratorsSection";

/** A row of `GET /api/courses/{id}/pricing-history`. */
export interface CoursePricingHistoryEntry {
  id: string;
  pricingModel: string;
  priceAmount: number | null;
  currency: string | null;
  changedAt: string;
  changedBy: string | null;
  changedByName: string;
}

/** The course record every editor here starts from; `null` while loading, `"error"` on failure. */
function useCourse(contentId: string) {
  const [course, setCourse] = useState<CourseResponse | null | "error">(null);
  useEffect(() => {
    let cancelled = false;
    api
      .get<CourseResponse>(`/api/courses/${contentId}`)
      .then((data) => !cancelled && setCourse(data))
      .catch(() => !cancelled && setCourse("error"));
    return () => {
      cancelled = true;
    };
  }, [contentId]);
  return course;
}

function LoadFailed({ what }: { what: string }) {
  // Saving from a form that never loaded would write blanks over the real values, so no form.
  return (
    <WorkspaceMessage icon={AlertTriangle} tone="warning" title={`Couldn’t load this course’s ${what}`}>
      Reload the page to try again.
    </WorkspaceMessage>
  );
}

/* ------------------------------------------------------------------ */
/*  Overview & Outcomes                                               */
/* ------------------------------------------------------------------ */

/**
 * Authors the fields the public course page reads for its Overview tab: the course preview,
 * declared length, description, and "what you'll walk away with" outcomes.
 */
export function CourseOverviewEditor({ contentId }: { contentId: string }) {
  const course = useCourse(contentId);
  if (course === null) return <WorkspaceLoading />;
  if (course === "error") return <LoadFailed what="overview" />;
  return <CourseOverviewForm contentId={contentId} course={course} />;
}

function CoursePreviewField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrlInput(value);
  }, [value]);

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    if (file.type && !file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Please select an image or video file");
      return;
    }
    setUploading(true);
    try {
      const uploadedUrl = await uploadFileToStorage(file, null);
      onChange(uploadedUrl);
      toast.success("Course preview media uploaded");
    } catch (err: any) {
      console.error("Preview upload error:", err);
      toast.error(err?.message || "Failed to upload preview media");
    } finally {
      setUploading(false);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    onChange(trimmed);
    if (trimmed) {
      toast.success("Preview link updated");
    }
  };

  if (value) {
    const media = parsePreviewMedia(value);
    return (
      <div className="space-y-3">
        <div className="relative max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm aspect-[16/9]">
          {media.kind === "image" ? (
            <img src={media.embedUrl} alt="Course preview" className="h-full w-full object-cover" />
          ) : media.kind === "youtube" || media.kind === "vimeo" ? (
            <iframe
              src={media.embedUrl}
              title="Course preview"
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={media.embedUrl} controls className="h-full w-full object-contain" />
          )}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            {media.kind === "image" ? "Image Preview" : "Video Preview"}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 max-w-lg">
          <p className="truncate text-xs font-medium text-slate-500 max-w-[280px]" title={value}>
            {value}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <UploadCloud size={14} />
              Replace file
            </button>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setUrlInput("");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tab toggle between Upload and Link */}
      <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            mode === "upload"
              ? "bg-surface text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UploadCloud size={14} />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode("link")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            mode === "link"
              ? "bg-surface text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <LinkIcon size={14} />
          Link / URL
        </button>
      </div>

      {mode === "upload" ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!uploading) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!uploading) handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center outline-none transition-colors ${
            dragging
              ? "border-blue-400 bg-blue-50/70"
              : "border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50"
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <span className="text-xs font-bold text-slate-700">Uploading preview media...</span>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-blue-600 shadow-xs">
                <UploadCloud size={24} />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800">
                  Choose a video or image file, or drag and drop
                </span>
                <p className="mt-0.5 text-xs text-slate-500 font-medium">
                  Supports MP4, WebM, PNG, JPG, WebP, SVG, GIF
                </p>
              </div>
              <button
                type="button"
                className="mt-1 rounded-xl bg-surface px-4 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs hover:bg-slate-100"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose file
              </button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative flex items-center">
            <LinkIcon size={16} className="pointer-events-none absolute left-4 text-slate-400" />
            <input
              id="course-preview-url"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyUrl();
                }
              }}
              placeholder="e.g. https://www.youtube.com/watch?v=... or direct video/image URL"
              className={workspaceField.inputWithIcon}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-slate-400">
              Paste a link to YouTube, Vimeo, or a hosted video / image file.
            </p>
            <button
              type="button"
              onClick={handleApplyUrl}
              disabled={!urlInput.trim()}
              className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Apply Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CourseOverviewForm({ contentId, course }: { contentId: string; course: CourseResponse }) {
  const initial = {
    previewUrl: course.previewUrl ?? "",
    duration: course.duration ?? "",
    description: course.description ?? "",
    learningOutcomes: course.learningOutcomes ?? "",
  };
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      // PATCH only the fields this form owns; the server ignores absent fields.
      await api.patch(`/api/courses/${contentId}`, {
        ...form,
        previewUrl: form.previewUrl ? form.previewUrl.trim() : null,
      });
      setSaved(form);
      toast.success("Course overview saved");
    } catch {
      toast.error("Could not save the course overview");
    } finally {
      setSaving(false);
    }
  };

  return (
    <WorkspaceRows>
      <WorkspaceRow
        step={1}
        title="Course preview"
        description="Optional. Add a preview video or image to showcase your course. If left blank, the “About this course” section acts as the preview."
      >
        <CoursePreviewField value={form.previewUrl} onChange={set("previewUrl")} />
      </WorkspaceRow>

      <WorkspaceRow step={2} title="Course length" description="Shown as-is on the course page. Leave blank to show “Self-paced”.">
        <div className="relative flex items-center">
          <Clock size={16} className="pointer-events-none absolute left-4 text-slate-400" />
          <input
            id="course-duration"
            type="text"
            value={form.duration}
            onChange={(e) => set("duration")(e.target.value)}
            placeholder="e.g. 4h 30m"
            className={workspaceField.inputWithIcon}
          />
        </div>
      </WorkspaceRow>

      <WorkspaceRow step={3} title="About this course" description="Write a brief overview of what this course is about.">
        <textarea
          id="course-description"
          value={form.description}
          onChange={(e) => set("description")(e.target.value)}
          placeholder="Write a brief overview of what this course is about..."
          className={workspaceField.textarea}
        />
      </WorkspaceRow>

      <WorkspaceRow
        step={4}
        title="What learners will walk away with"
        description="One per line. Each line becomes a ticked bullet on the course page."
      >
        <textarea
          id="course-outcomes"
          value={form.learningOutcomes}
          onChange={(e) => set("learningOutcomes")(e.target.value)}
          placeholder={"One outcome per line, e.g.\nA working design system in Figma\nA recorded portfolio case study"}
          className={workspaceField.textarea}
        />
      </WorkspaceRow>

      <WorkspaceSaveBar onSave={save} saving={saving} dirty={dirty} label="Save overview" savedLabel="Overview saved" />
    </WorkspaceRows>
  );
}

/* ------------------------------------------------------------------ */
/*  Category                                                          */
/* ------------------------------------------------------------------ */

/** Assigns the course category from the super-user managed list. */
export function CourseCategoryEditor({ contentId }: { contentId: string }) {
  const course = useCourse(contentId);
  if (course === null) return <WorkspaceLoading />;
  if (course === "error") return <LoadFailed what="category" />;
  return <CourseCategoryForm contentId={contentId} initial={course.categoryId ?? null} />;
}

function CourseCategoryForm({ contentId, initial }: { contentId: string; initial: string | null }) {
  const categories = usePublicCategories("COURSES");
  const [saved, setSaved] = useState(initial);
  const [categoryId, setCategoryId] = useState(initial);
  const [saving, setSaving] = useState(false);
  const selected = categories.find((c) => c.id === categoryId);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/api/courses/${contentId}/category`, { categoryId: categoryId || null });
      setSaved(categoryId);
      toast.success("Category saved");
    } catch {
      toast.error("Could not save category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <WorkspaceRows>
      <WorkspaceRow
        step={1}
        title="Course category"
        description="Helps learners find this course in Explore search filters and topic feeds."
      >
        <select
          id="course-category-select"
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(e.target.value || null)}
          className={workspaceField.select}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
          <option value="">Other / Uncategorized</option>
        </select>
        {selected?.description && <p className="px-1 pt-1 text-xs font-medium leading-relaxed text-slate-500">{selected.description}</p>}
      </WorkspaceRow>

      <WorkspaceSaveBar onSave={save} saving={saving} dirty={categoryId !== saved} label="Save category" savedLabel="Category saved" />
    </WorkspaceRows>
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing                                                           */
/* ------------------------------------------------------------------ */

/**
 * The course's pricing model and amount, and the audit trail of past changes. Renders as the
 * body of a Settings row. Amounts are edited as a decimal and sent as integer minor units via the
 * shared money helpers, so a price set here reads back identically on the public course page.
 */
export function CoursePricingFields({ contentId, readOnly }: { contentId: string; readOnly?: boolean }) {
  const course = useCourse(contentId);
  if (course === null) return <WorkspaceLoading />;
  if (course === "error") return <LoadFailed what="pricing" />;
  return <CoursePricingForm contentId={contentId} course={course} readOnly={readOnly} />;
}

function CoursePricingForm({ contentId, course, readOnly }: { contentId: string; course: CourseResponse; readOnly?: boolean }) {
  const initial = {
    model: (course.pricingModel === "PAID" ? "PAID" : "FREE") as "FREE" | "PAID",
    amount: course.priceAmount != null ? String(fromMinorUnits(course.priceAmount)) : "",
  };
  const currency = course.currency || "INR";
  const [saved, setSaved] = useState(initial);
  const [model, setModel] = useState(initial.model);
  const [amount, setAmount] = useState(initial.amount);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<CoursePricingHistoryEntry[] | null>(null);

  const loadHistory = () =>
    api
      .get<CoursePricingHistoryEntry[]>(`/api/courses/${contentId}/pricing-history`)
      .then(setHistory)
      .catch(() => setHistory([]));

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per course
  }, [contentId]);

  const dirty = model !== saved.model || (model === "PAID" && amount !== saved.amount);

  const save = async () => {
    if (model === "PAID" && !(Number(amount) > 0)) {
      toast.error("Enter a price greater than zero for a paid course.");
      return;
    }
    setSaving(true);
    try {
      // A FREE course sends no amount; the server clears any stale one, so the public page can
      // never show a price next to a free course.
      await api.patch(`/api/courses/${contentId}`, {
        pricingModel: model,
        priceAmount: model === "PAID" ? toMinorUnits(Number(amount)) : 0,
        currency,
      });
      setSaved({ model, amount: model === "PAID" ? amount : "" });
      toast.success("Pricing saved");
      await loadHistory();
    } catch {
      toast.error("Could not save pricing");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <WorkspaceChoice
        value={model}
        onChange={setModel}
        disabled={readOnly}
        options={[
          { value: "FREE", label: "Free", hint: "Anyone can enrol at no cost." },
          { value: "PAID", label: "Paid", hint: "Learners pay once to enrol. A 20% platform fee applies." },
        ]}
      />

      {model === "PAID" && (
        <div>
          <WorkspaceLabel htmlFor="price-amount">Price ({currency})</WorkspaceLabel>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-4 text-sm font-bold text-slate-400">{currency === "INR" ? "₹" : currency}</span>
            <input
              id="price-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              disabled={readOnly}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 499.00"
              className={workspaceField.inputWithIcon}
            />
          </div>
        </div>
      )}

      {!readOnly && <WorkspaceSaveBar onSave={save} saving={saving} dirty={dirty} label="Save pricing" savedLabel="Pricing saved" />}

      {history && history.length > 0 && (
        <div className="pt-2">
          <WorkspaceLabel>Pricing history</WorkspaceLabel>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-2 pr-3">Model</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="py-2 pr-3">Changed by</th>
                  <th className="py-2 text-right">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-2.5 pr-3 font-bold text-slate-800">{entry.pricingModel === "PAID" ? "Paid" : "Free"}</td>
                    <td className="py-2.5 pr-3">
                      {entry.pricingModel === "PAID" && entry.priceAmount != null ? formatMoney(entry.priceAmount, entry.currency || "INR") : "—"}
                    </td>
                    <td className="py-2.5 pr-3">{entry.changedByName}</td>
                    <td className="py-2.5 text-right tabular-nums text-slate-400">
                      {new Date(entry.changedAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Settings                                                          */
/* ------------------------------------------------------------------ */

export function CourseSettingsTab({
  contentId,
  readOnly,
  collaborators,
  collaboratorsUnavailable,
  canManageCollaborators,
  onChanged,
}: {
  contentId: string;
  readOnly?: boolean;
  collaborators?: CollaboratorLite[];
  collaboratorsUnavailable?: boolean;
  canManageCollaborators: boolean;
  onChanged: () => void;
}) {
  return (
    <WorkspaceRows>
      <WorkspaceRow step={1} title="Schedule" description="When learners can enroll in and access this course. Leave open for always available." wide>
        <SchedulePanel contentType="COURSE" contentId={contentId} readOnly={readOnly} bare />
      </WorkspaceRow>
      <WorkspaceRow step={2} title="Completion badge" description="The recognition learners receive after completing this course." wide>
        <BadgeTierPanel contentType="COURSE" contentId={contentId} readOnly={readOnly} bare />
      </WorkspaceRow>
      <WorkspaceRow step={3} title="Pricing" description="How learners get access to this course.">
        <CoursePricingFields contentId={contentId} readOnly={readOnly} />
      </WorkspaceRow>
      <WorkspaceRow step={4} title="Collaborators" description="Team members who can manage or edit this course with you." wide>
        <CollaboratorsSection
          segment="course"
          contentId={contentId}
          collaborators={collaborators}
          unavailable={collaboratorsUnavailable}
          canManage={canManageCollaborators}
          onChanged={onChanged}
          bare
        />
      </WorkspaceRow>
    </WorkspaceRows>
  );
}
