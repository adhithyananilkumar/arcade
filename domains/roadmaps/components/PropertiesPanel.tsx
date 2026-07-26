"use client";

import React, { useState } from "react";
import {
  X,
  Settings,
  BookOpen,
  HelpCircle,
  FileText,
  Link as LinkIcon,
  PlaySquare,
  Folder,
  Sparkles,
  Star,
  Award,
  Target,
  Palette,
  GraduationCap,
  Layers,
  Sparkle
} from "lucide-react";
import { useRoadmap } from "../store/RoadmapStore";

const DIFFICULTY_OPTIONS = [
  { label: "Beginner", value: "Beginner" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Advanced", value: "Advanced" },
];

const NODE_TYPE_OPTIONS = [
  { label: "Lesson / Article", value: "lesson" },
  { label: "Quiz / Assessment", value: "quiz" },
  { label: "Assignment / Project", value: "assignment" },
  { label: "External Resource", value: "resource" },
  { label: "Video Tutorial", value: "video" },
  { label: "Section Header", value: "section" },
];

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Under Review", value: "review" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const SHADOW_OPTIONS = [
  { label: "None", value: "shadow-none" },
  { label: "Small Shadow", value: "shadow-xs" },
  { label: "Medium Shadow", value: "shadow-md" },
  { label: "Large Glow", value: "shadow-xl" },
];

const BORDER_RADIUS_OPTIONS = [
  { label: "Square (0px)", value: "rounded-none" },
  { label: "Rounded (8px)", value: "rounded-lg" },
  { label: "Soft Curved (12px)", value: "rounded-xl" },
  { label: "Pill (9999px)", value: "rounded-full" },
];

const PRESET_BG_COLORS = [
  { label: "White", value: "bg-white", hex: "#ffffff" },
  { label: "Indigo", value: "bg-indigo-600", hex: "#4f46e5" },
  { label: "Rose", value: "bg-rose-500", hex: "#f43f5e" },
  { label: "Amber", value: "bg-amber-500", hex: "#f59e0b" },
  { label: "Emerald", value: "bg-emerald-500", hex: "#10b981" },
  { label: "Blue", value: "bg-sky-500", hex: "#0ea5e9" },
  { label: "Slate", value: "bg-slate-800", hex: "#1e293b" },
];

const PRESET_TEXT_COLORS = [
  { label: "Dark", value: "text-gray-900", hex: "#111827" },
  { label: "White", value: "text-white", hex: "#ffffff" },
  { label: "Indigo", value: "text-indigo-600", hex: "#4f46e5" },
  { label: "Rose", value: "text-rose-600", hex: "#e11d48" },
  { label: "Emerald", value: "text-emerald-600", hex: "#059669" },
];

const PRESET_BORDER_COLORS = [
  { label: "Default", hex: "#e5e7eb" },
  { label: "Indigo", hex: "#4f46e5" },
  { label: "Rose", hex: "#f43f5e" },
  { label: "Amber", hex: "#f59e0b" },
  { label: "Emerald", hex: "#10b981" },
];

const ICON_OPTIONS = [
  { value: "BookOpen", label: "Lesson / Book", icon: BookOpen },
  { value: "HelpCircle", label: "Quiz / Question", icon: HelpCircle },
  { value: "FileText", label: "Assignment / Doc", icon: FileText },
  { value: "LinkIcon", label: "External Link", icon: LinkIcon },
  { value: "PlaySquare", label: "Video", icon: PlaySquare },
  { value: "Folder", label: "Module / Folder", icon: Folder },
  { value: "Sparkles", label: "Inspiration", icon: Sparkles },
  { value: "Star", label: "Featured", icon: Star },
  { value: "Award", label: "Certificate", icon: Award },
  { value: "Target", label: "Goal", icon: Target },
];

export function PropertiesPanel() {
  const { selectedNode, setSelectedNodeId, updateTopic, readOnly, contentType } = useRoadmap();
  
  const [activeTab, setActiveTab] = useState<"general" | "learning" | "style">("general");

  if (!selectedNode) return null;

  const data = selectedNode.data;
  const colorValue = (data.color as string) || "";
  const borderColorValue = (data.borderColor as string) || "";
  const fontColorValue = (data.fontColor as string) || "";

  const handleChange = (field: string, value: any) => {
    updateTopic(selectedNode.id, { [field]: value });
  };

  const onClose = () => setSelectedNodeId(null);
  const isDocked = contentType === "roadmap";

  const containerClasses = isDocked
    ? "w-96 h-full border-l border-gray-200 bg-white flex flex-col shrink-0 relative z-30 animate-in slide-in-from-right duration-200"
    : "absolute top-4 right-4 bottom-4 w-84 z-30 bg-white/95 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200";

  return (
    <div className={containerClasses}>
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
        <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-2">
          <Settings size={14} className="text-indigo-600" />
          <span>Node Properties</span>
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Navigation Tabs (General, Learning, Style) */}
      <div className="flex items-center border-b border-gray-200 bg-gray-50/60 p-1 flex-shrink-0">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "general"
              ? "bg-white text-indigo-600 shadow-xs"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Settings size={13} />
          <span>General</span>
        </button>
        <button
          onClick={() => setActiveTab("learning")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "learning"
              ? "bg-white text-indigo-600 shadow-xs"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <GraduationCap size={13} />
          <span>Learning</span>
        </button>
        <button
          onClick={() => setActiveTab("style")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "style"
              ? "bg-white text-indigo-600 shadow-xs"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Palette size={13} />
          <span>Style</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-none">
        
        {/* 1. GENERAL TAB */}
        {activeTab === "general" && (
          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Title</label>
              <input
                type="text"
                disabled={readOnly}
                value={(data.label as string) || ""}
                onChange={(e) => handleChange("label", e.target.value)}
                placeholder="Topic Title..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                rows={3}
                disabled={readOnly}
                value={(data.description as string) || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe what learners will achieve..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Node Type</label>
                <select
                  disabled={readOnly}
                  value={(data.nodeType as string) || "lesson"}
                  onChange={(e) => handleChange("nodeType", e.target.value)}
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  {NODE_TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
                <select
                  disabled={readOnly}
                  value={(data.status as string) || "draft"}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Difficulty</label>
                <select
                  disabled={readOnly}
                  value={(data.difficulty as string) || ""}
                  onChange={(e) => handleChange("difficulty", e.target.value)}
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value="">None</option>
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Duration</label>
                <input
                  type="text"
                  disabled={readOnly}
                  value={(data.duration as string) || ""}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  placeholder="e.g. 45 mins"
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. LEARNING TAB */}
        {activeTab === "learning" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Node Type</label>
                <select
                  disabled={readOnly}
                  value={(data.nodeType as string) || "lesson"}
                  onChange={(e) => handleChange("nodeType", e.target.value)}
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  {NODE_TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
                <select
                  disabled={readOnly}
                  value={(data.status as string) || "draft"}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Duration</label>
                <input
                  type="text"
                  disabled={readOnly}
                  value={(data.duration as string) || ""}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  placeholder="e.g. 15 min"
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Difficulty</label>
                <select
                  disabled={readOnly}
                  value={(data.difficulty as string) || ""}
                  onChange={(e) => handleChange("difficulty", e.target.value)}
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value="">None</option>
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Link Arcade Content</label>
              <input
                type="text"
                disabled={readOnly}
                value={(data.linkedCourseId as string) || (data.linkedWorkshopId as string) || ""}
                onChange={(e) => handleChange("linkedCourseId", e.target.value)}
                placeholder="Select content..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* 3. STYLE TAB */}
        {activeTab === "style" && (
          <div className="space-y-4">
            {/* Background Color */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Background Color</label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_BG_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    disabled={readOnly}
                    onClick={() => handleChange("color", c.value)}
                    className={`w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center transition-transform hover:scale-110 ${
                      data.color === c.value ? "ring-2 ring-indigo-500 ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                <div className="relative w-6 h-6 rounded-full border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                  <input
                    type="color"
                    disabled={readOnly}
                    value={colorValue.startsWith("#") ? colorValue : "#ffffff"}
                    onChange={(e) => handleChange("color", e.target.value)}
                    className="absolute inset-[-10px] w-12 h-12 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Border Color */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Border Color</label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_BORDER_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.label}
                    disabled={readOnly}
                    onClick={() => handleChange("borderColor", c.hex)}
                    className={`w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center transition-transform hover:scale-110 ${
                      data.borderColor === c.hex ? "ring-2 ring-indigo-500 ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                <div className="relative w-6 h-6 rounded-full border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                  <input
                    type="color"
                    disabled={readOnly}
                    value={borderColorValue.startsWith("#") ? borderColorValue : "#e5e7eb"}
                    onChange={(e) => handleChange("borderColor", e.target.value)}
                    className="absolute inset-[-10px] w-12 h-12 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Text Color</label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_TEXT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    disabled={readOnly}
                    onClick={() => handleChange("fontColor", c.value)}
                    className={`w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center transition-transform hover:scale-110 ${
                      data.fontColor === c.value ? "ring-2 ring-indigo-500 ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                <div className="relative w-6 h-6 rounded-full border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                  <input
                    type="color"
                    disabled={readOnly}
                    value={fontColorValue.startsWith("#") ? fontColorValue : "#111827"}
                    onChange={(e) => handleChange("fontColor", e.target.value)}
                    className="absolute inset-[-10px] w-12 h-12 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Shadow & Border Radius */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Shadow</label>
                <select
                  disabled={readOnly}
                  value={(data.shadow as string) || "shadow-xs"}
                  onChange={(e) => handleChange("shadow", e.target.value)}
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  {SHADOW_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Border Radius</label>
                <select
                  disabled={readOnly}
                  value={(data.borderRadius as string) || "rounded-xl"}
                  onChange={(e) => handleChange("borderRadius", e.target.value)}
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  {BORDER_RADIUS_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Topic Icon */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Topic Icon</label>
              <select
                disabled={readOnly}
                value={(data.icon as string) || ""}
                onChange={(e) => handleChange("icon", e.target.value)}
                className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="">No Icon</option>
                {ICON_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
