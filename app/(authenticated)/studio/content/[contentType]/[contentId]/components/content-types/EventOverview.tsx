"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Camera,
  Layers,
  FileText,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Globe,
  Shield,
  Loader2,
  Radio,
  Tv,
} from "lucide-react";
import { api } from "@/infrastructure/http/api";
import { updateEvent } from "@/domains/events/api/event";
import type { OverviewData } from "../../lib/fetchOverviewData";
import type { OverviewTab } from "../ContentOverviewNav";
import type { Metric } from "../sections/MetricsGrid";
import { MetricsGrid } from "../sections/MetricsGrid";
import { EventPricingSection } from "../sections/EventPricingSection";
import { EventSettingsSection } from "../sections/EventSettingsSection";
import { RegisteredMembersSection } from "../sections/RegisteredMembersSection";
import { EventCollaboratorsManager } from "@/app/(authenticated)/studio/events/components/wizard/review/EventCollaboratorsManager";
import { PublishingWorkflow } from "../sections/PublishingWorkflow";
import { ReadinessCard } from "../sections/ReadinessCard";
import { EmptyState } from "../sections/EmptyState";
import { editorHref } from "../../lib/contentTypeRouting";

function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function analyticsToMetrics(analytics?: Record<string, unknown>): Metric[] {
  if (!analytics) return [];
  return Object.entries(analytics)
    .filter(([, value]) => typeof value === "number" || typeof value === "string")
    .map(([key, value]) => ({ label: humanizeKey(key), value: value as string | number }));
}

export function getEventMetrics(data: OverviewData): Metric[] {
  const count = data.eventParticipants?.status === "ok" ? data.eventParticipants.data.length : 0;
  return [
    { label: "Registrations", value: count, sublabel: "Confirmed attendees" },
    { label: "Capacity Limit", value: data.eventDetails?.status === "ok" && data.eventDetails.data.capacity ? String(data.eventDetails.data.capacity) : "Unlimited", sublabel: "Max seats" },
    { label: "Delivery", value: data.eventDetails?.status === "ok" ? (data.eventDetails.data.deliveryMode || "Online") : "Online", sublabel: "Format" },
    { label: "Status", value: data.content?.status || "DRAFT", sublabel: "Lifecycle" },
  ];
}

const formatLanguage = (lang?: string | null) => {
  if (!lang) return "EN";
  const l = lang.trim().toLowerCase();
  if (l === "english") return "EN";
  if (l === "spanish") return "ES";
  if (l === "french") return "FR";
  if (l === "german") return "DE";
  if (l === "hindi") return "HI";
  return l.substring(0, 2).toUpperCase();
};

export function EventOverviewTab({
  tab,
  data,
  contentId,
  currentUserId,
  onChanged,
  onSubmit,
  submitting,
  onSelectTab,
}: {
  tab: OverviewTab;
  data: OverviewData;
  contentId: string;
  currentUserId?: string | null;
  onChanged: () => void;
  onSubmit: () => void;
  submitting: boolean;
  onSelectTab?: (tab: OverviewTab) => void;
}) {
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const eventSummary = data.eventSummary?.status === "ok" ? data.eventSummary.data : null;
  const eventDetails = data.eventDetails?.status === "ok" ? data.eventDetails.data : null;
  const content = data.content;

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      // 1. Presign
      const { key, uploadUrl, publicUrl } = await api.post<any>("/api/media/presign", {
        fileName: file.name,
        contentType: file.type,
      });

      // 2. Upload via proxy
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadUrl", uploadUrl);

      const uploadRes = await fetch("/api/internal/media/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Failed to upload file to storage");

      // 3. Register metadata
      await api.post("/api/media/metadata", {
        key,
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });

      // 4. Update event
      await updateEvent(contentId, { coverImageUrl: publicUrl });
      toast.success("Cover image updated successfully");
      onChanged();
    } catch (error) {
      console.error("Cover upload error:", error);
      toast.error("Failed to upload cover image");
    } finally {
      setIsUploadingCover(false);
    }
  };

  // ── Pricing Tab ─────────────────────────────────────────────────────────────
  if (tab === "pricing") {
    return (
      <EventPricingSection
        eventId={contentId}
        eventDetails={data.eventDetails}
        participantCount={data.eventParticipants?.status === "ok" ? data.eventParticipants.data.length : 0}
        onChanged={onChanged}
      />
    );
  }

  // ── Settings Tab ────────────────────────────────────────────────────────────
  if (tab === "settings") {
    return (
      <EventSettingsSection
        eventId={contentId}
        initialEvent={eventDetails}
        onChanged={onChanged}
      />
    );
  }

  // ── Members Tab (Manage Members) ───────────────────────────────────────────
  if (tab === "participants" || tab === "people") {
    return (
      <RegisteredMembersSection
        eventId={contentId}
        participantsResult={data.eventParticipants}
        onChanged={onChanged}
      />
    );
  }

  // ── Collaborators Tab ───────────────────────────────────────────────────────
  if (tab === "collaborators") {
    return (
      <div className="flex flex-col gap-6">
        <EventCollaboratorsManager eventId={contentId} />
      </div>
    );
  }

  // ── Publishing Tab ──────────────────────────────────────────────────────────
  if (tab === "publishing") {
    return (
      <PublishingWorkflow
        status={content?.status ?? "DRAFT"}
        review={data.review.status === "ok" ? data.review.data : null}
        editHref={editorHref("event", contentId)}
        onSubmit={onSubmit}
        submitting={submitting}
        reviewPath={data.reviewPath.status === "ok" ? data.reviewPath.data : null}
        reviewPathError={
          data.reviewPath.status === "error"
            ? "Could not determine the review path for this content."
            : null
        }
        historyEntries={
          data.statusHistory.status === "ok"
            ? data.statusHistory.data.map((entry, i) => ({
                id: `${entry.createdAt}-${i}`,
                title: entry.label,
                actorName: entry.actorName,
                createdAt: entry.createdAt,
              }))
            : undefined
        }
      />
    );
  }

  // ── Analytics Tab ───────────────────────────────────────────────────────────
  if (tab === "analytics") {
    if (data.eventAnalytics?.status === "error") {
      return (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
          <AlertTriangle size={14} /> Analytics temporarily unavailable — try again shortly.
        </div>
      );
    }
    const metrics = data.eventAnalytics?.status === "ok" ? analyticsToMetrics(data.eventAnalytics.data) : [];
    if (metrics.length === 0) {
      return (
        <EmptyState
          title="No learner activity yet"
          description="Analytics will appear once learners interact with this event."
        />
      );
    }
    return <MetricsGrid metrics={metrics} />;
  }

  // ── Default: Overview Tab ───────────────────────────────────────────────────
  const coverUrl = eventDetails?.coverImageUrl || content?.coverImageUrl;
  const sessionsCount = eventSummary?.sessionsCount ?? 0;
  const resourcesCount = eventSummary?.resourcesCount ?? 0;
  const registrationsCount = data.eventParticipants?.status === "ok" ? data.eventParticipants.data.length : 0;
  const revenue = (data.eventAnalytics?.status === "ok" ? (data.eventAnalytics.data.totalRevenue as number) : 0) || 0;
  const currency = eventDetails?.currency || "INR";
  const formattedRevenue = new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(revenue);

  const completionPct = eventSummary?.completionPercentage ?? (data.eventReadiness?.status === "ok" ? data.eventReadiness.data.completionPercentage : 0);

  const setupChecklist = [
    { name: "Schedule & Sessions", complete: eventSummary?.scheduleComplete ?? (sessionsCount > 0), action: () => {} },
    { name: "Pricing & Capacity", complete: eventSummary?.pricingComplete ?? true, action: () => onSelectTab?.("pricing") },
    { name: "Resources & Folders", complete: eventSummary?.resourcesComplete ?? true, action: () => {} },
    { name: "Event Settings", complete: eventSummary?.settingsComplete ?? true, action: () => onSelectTab?.("settings") },
    { name: "Review & Publish", complete: content?.status === "PUBLISHED", action: () => onSelectTab?.("publishing") },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Top Banner / Cover Image with hover change overlay */}
      <div className="relative group overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-900 shadow-[0_8px_30px_rgba(20,20,43,0.06)] h-56 sm:h-72 w-full transition-all">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={content?.title || "Event cover"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-slate-400 p-6 text-center">
            <Camera size={36} className="text-slate-500 mb-2" />
            <p className="text-sm font-bold text-slate-200">No cover image uploaded</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Add a vibrant thumbnail to make your workshop and webinar stand out to learners.
            </p>
          </div>
        )}

        {/* Change Cover Hover Overlay */}
        <label className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer text-white">
          {isUploadingCover ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-white" />
              <span className="text-xs font-bold uppercase tracking-wider">Uploading to R2...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-5 py-2.5 border border-white/30 text-xs font-extrabold hover:bg-white/30 transition-all shadow-lg active:scale-95">
              <Camera size={16} />
              <span>{coverUrl ? "Change Cover Image" : "Upload Cover Image"}</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            disabled={isUploadingCover}
            className="hidden"
          />
        </label>
      </div>

      {/* Readiness Check Card */}
      {data.eventReadiness?.status === "ok" && (
        <ReadinessCard readiness={data.eventReadiness.data} continueHref={editorHref("event", contentId)} />
      )}

      {/* Main Grid: Details, Statistics & Setup Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Details & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Details Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_4px_16px_rgba(20,20,43,0.03)] backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#14142b] flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600" />
                Event Details
              </h3>
              <button
                type="button"
                onClick={() => onSelectTab?.("settings")}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Edit in Settings →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Visibility
                </div>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                  {eventDetails?.visibility || "PUBLIC"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Delivery Mode
                </div>
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                  {eventDetails?.deliveryMode || "ONLINE"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Language
                </div>
                <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-700">
                  {formatLanguage(eventDetails?.language)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Event Type
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  {eventDetails?.eventType || "WORKSHOP"}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics Grid Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_4px_16px_rgba(20,20,43,0.03)] backdrop-blur-sm">
            <h3 className="text-sm font-bold text-[#14142b] border-b border-slate-100 pb-3 mb-4">
              Event Metrics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/60 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <Calendar size={13} className="text-blue-500" />
                  Sessions
                </div>
                <div className="text-2xl font-black text-[#14142b]">{sessionsCount}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Workshop days</div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/60 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <FileText size={13} className="text-indigo-500" />
                  Resources
                </div>
                <div className="text-2xl font-black text-[#14142b]">{resourcesCount}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Attached files</div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/60 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <Users size={13} className="text-emerald-500" />
                  Registrations
                </div>
                <div className="text-2xl font-black text-[#14142b]">{registrationsCount}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Joined attendees</div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/60 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <DollarSign size={13} className="text-amber-500" />
                  Revenue
                </div>
                <div className="text-2xl font-black text-[#14142b]">{formattedRevenue}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Gross ticket sales</div>
              </div>
            </div>
          </div>

          {/* Setup Checklist */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_4px_16px_rgba(20,20,43,0.03)] backdrop-blur-sm">
            <h3 className="text-sm font-bold text-[#14142b] border-b border-slate-100 pb-3 mb-4">
              Complete Your Setup
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {setupChecklist.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={item.action}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-blue-400 hover:bg-blue-50/40 transition-all text-left group cursor-pointer shadow-2xs"
                >
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </span>
                  {item.complete ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  ) : (
                    <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Progress & Recent Activity */}
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_4px_16px_rgba(20,20,43,0.03)] backdrop-blur-sm">
            <h3 className="text-sm font-bold text-[#14142b] mb-3">Setup Progress</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Readiness</span>
              <span className="text-sm font-extrabold text-blue-600">{completionPct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_4px_16px_rgba(20,20,43,0.03)] backdrop-blur-sm">
            <h3 className="text-sm font-bold text-[#14142b] flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Clock size={16} className="text-slate-500" />
              Recent Activity
            </h3>

            {eventSummary?.recentActivity && eventSummary.recentActivity.length > 0 ? (
              <div className="relative border-l-2 border-slate-100 ml-2 space-y-5 pb-1">
                {eventSummary.recentActivity.slice(0, 5).map((log, idx) => (
                  <div key={idx} className="relative pl-5">
                    <div className="absolute -left-[5px] mt-1 size-2 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="text-xs font-bold text-slate-900 leading-snug">{log.action}</div>
                    {log.description && (
                      <div className="text-[11px] text-slate-500 mt-0.5">{log.description}</div>
                    )}
                    <div className="text-[10px] font-semibold text-slate-400 mt-1">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(log.timestamp))}
                    </div>
                  </div>
                ))}
              </div>
            ) : data.statusHistory?.status === "ok" && data.statusHistory.data.length > 0 ? (
              <div className="relative border-l-2 border-slate-100 ml-2 space-y-5 pb-1">
                {data.statusHistory.data.slice(0, 5).map((entry, idx) => (
                  <div key={idx} className="relative pl-5">
                    <div className="absolute -left-[5px] mt-1 size-2 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="text-xs font-bold text-slate-900 leading-snug">{entry.label}</div>
                    {entry.actorName && (
                      <div className="text-[11px] text-slate-500 mt-0.5">by {entry.actorName}</div>
                    )}
                    <div className="text-[10px] font-semibold text-slate-400 mt-1">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(entry.createdAt))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">No activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
