"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, Settings, Globe, Shield, Video, Layers, Sparkles, Loader2 } from "lucide-react";
import { api } from "@/infrastructure/http/api";
import type { Event as EventDto } from "@/domains/events/types/event.types";
import {
  EventType,
  DeliveryMode,
  Difficulty,
  Visibility,
} from "@/domains/events/types/event.types";

interface Props {
  eventId: string;
  initialEvent?: EventDto | null;
  onChanged: () => void;
}

const CATEGORIES = [
  "Artificial Intelligence",
  "Web Development",
  "Design & Creative",
  "Data Science",
  "Cloud & DevOps",
  "Product Management",
  "Business & Leadership",
  "Cybersecurity",
  "Mobile Development",
  "General",
];

const LANGUAGES = [
  { code: "English", label: "English (EN)" },
  { code: "Spanish", label: "Spanish (ES)" },
  { code: "French", label: "French (FR)" },
  { code: "German", label: "German (DE)" },
  { code: "Hindi", label: "Hindi (HI)" },
  { code: "Japanese", label: "Japanese (JA)" },
];

export function EventSettingsSection({ eventId, initialEvent, onChanged }: Props) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: initialEvent?.title ?? "",
    subtitle: initialEvent?.subtitle ?? "",
    description: initialEvent?.description ?? "",
    category: initialEvent?.category ?? "General",
    tags: (initialEvent?.tags ?? []).join(", "),
    eventType: initialEvent?.eventType ?? EventType.WORKSHOP,
    deliveryMode: initialEvent?.deliveryMode ?? DeliveryMode.ONLINE,
    difficulty: initialEvent?.difficulty ?? Difficulty.BEGINNER,
    language: initialEvent?.language ?? "English",
    visibility: initialEvent?.visibility ?? Visibility.PUBLIC,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Event title cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const parsedTags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await api.patch(`/api/v1/events/${eventId}`, {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || null,
        description: formData.description.trim() || null,
        category: formData.category,
        tags: parsedTags,
        eventType: formData.eventType,
        deliveryMode: formData.deliveryMode,
        difficulty: formData.difficulty,
        language: formData.language,
        visibility: formData.visibility,
      });

      toast.success("Event settings updated successfully");
      onChanged();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const labelCls = "block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2";
  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs";

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#14142b] flex items-center gap-2">
            <Settings size={20} className="text-blue-600" />
            Event Settings
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Configure metadata, event format, language, and visibility controls
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Basic Info Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_4px_16px_rgba(20,20,43,0.03)] backdrop-blur-sm space-y-5">
        <h3 className="text-sm font-bold text-[#14142b] flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles size={16} className="text-indigo-600" />
          Basic Information
        </h3>

        <div>
          <label className={labelCls}>Event Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={inputCls}
            placeholder="e.g. Masterclass in Generative AI Architecture"
          />
        </div>

        <div>
          <label className={labelCls}>Subtitle / Tagline</label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => handleChange("subtitle", e.target.value)}
            className={inputCls}
            placeholder="e.g. Practical hands-on workshop building agents from scratch"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className={inputCls}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              className={inputCls}
              placeholder="e.g. AI, LLM, Python, Cloud"
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className={inputCls + " resize-none"}
            placeholder="Detailed description of what participants will learn, prerequisites, and agenda..."
          />
        </div>
      </div>

      {/* Format & Delivery Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_4px_16px_rgba(20,20,43,0.03)] backdrop-blur-sm space-y-6">
        <h3 className="text-sm font-bold text-[#14142b] flex items-center gap-2 border-b border-slate-100 pb-3">
          <Video size={16} className="text-blue-600" />
          Format & Delivery
        </h3>

        {/* Event Type Grid */}
        <div>
          <label className={labelCls}>Event Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {[
              { type: EventType.WORKSHOP, label: "Workshop" },
              { type: EventType.WEBINAR, label: "Webinar" },
              { type: EventType.BOOTCAMP, label: "Bootcamp" },
              { type: EventType.MASTERCLASS, label: "Masterclass" },
              { type: EventType.AMA, label: "AMA" },
            ].map(({ type, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => handleChange("eventType", type)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  formData.eventType === type
                    ? "border-blue-600 bg-blue-50/80 text-blue-700 shadow-xs ring-1 ring-blue-600"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Mode */}
        <div>
          <label className={labelCls}>Delivery Mode</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { mode: DeliveryMode.ONLINE, label: "Online Live" },
              { mode: DeliveryMode.OFFLINE, label: "In-Person" },
              { mode: DeliveryMode.HYBRID, label: "Hybrid" },
              { mode: DeliveryMode.RECORDED, label: "Recorded" },
            ].map(({ mode, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleChange("deliveryMode", mode)}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  formData.deliveryMode === mode
                    ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-xs ring-1 ring-indigo-600"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Skill Level / Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {[Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => handleChange("difficulty", lvl)}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    formData.difficulty === lvl
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Primary Language</label>
            <select
              value={formData.language}
              onChange={(e) => handleChange("language", e.target.value)}
              className={inputCls}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Visibility & Access Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_4px_16px_rgba(20,20,43,0.03)] backdrop-blur-sm space-y-4">
        <h3 className="text-sm font-bold text-[#14142b] flex items-center gap-2 border-b border-slate-100 pb-3">
          <Shield size={16} className="text-emerald-600" />
          Visibility & Access
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              v: Visibility.PUBLIC,
              title: "Public Event",
              desc: "Listed on discovery channels and open for participants to register.",
            },
            {
              v: Visibility.PRIVATE,
              title: "Private Event",
              desc: "Only registered members and direct link holders can view or join.",
            },
          ].map(({ v, title, desc }) => (
            <label
              key={v}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                formData.visibility === v
                  ? "border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600"
                  : "border-slate-200 bg-white hover:bg-slate-50/60"
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value={v}
                checked={formData.visibility === v}
                onChange={() => handleChange("visibility", v)}
                className="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">{title}</span>
                <span className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Bottom Save Action */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Saving Changes…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
