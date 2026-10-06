"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/infrastructure/http/api";
import type { Event as EventDto } from "@/domains/events";
import { EventType, DeliveryMode, Difficulty, Visibility } from "@/domains/events/types/event.types";
import {
  WorkspaceChoice,
  WorkspaceLabel,
  WorkspaceRow,
  WorkspaceRows,
  WorkspaceSaveBar,
  workspaceField,
} from "@/apps/creator/studio/core/StudioWorkspaceKit";

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

function formOf(event?: EventDto | null) {
  return {
    title: event?.title ?? "",
    subtitle: event?.subtitle ?? "",
    description: event?.description ?? "",
    category: event?.category ?? "General",
    tags: (event?.tags ?? []).join(", "),
    eventType: event?.eventType ?? EventType.WORKSHOP,
    deliveryMode: event?.deliveryMode ?? DeliveryMode.ONLINE,
    difficulty: event?.difficulty ?? Difficulty.BEGINNER,
    language: event?.language ?? "English",
    visibility: event?.visibility ?? Visibility.PUBLIC,
  };
}

type EventForm = ReturnType<typeof formOf>;

/**
 * The event's details — what it is called, what it is about, its format and who can see it — as
 * the numbered rows every Content Overview form uses, saved together.
 */
export function EventSettingsSection({ eventId, initialEvent, onChanged }: Props) {
  const [saved, setSaved] = useState<EventForm>(() => formOf(initialEvent));
  const [form, setForm] = useState<EventForm>(saved);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  const set = <K extends keyof EventForm>(field: K, value: EventForm[K]) => setForm((prev) => ({ ...prev, [field]: value }));

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("Event title cannot be empty");
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/api/v1/events/${eventId}`, {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        category: form.category,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        eventType: form.eventType,
        deliveryMode: form.deliveryMode,
        difficulty: form.difficulty,
        language: form.language,
        visibility: form.visibility,
      });
      setSaved(form);
      toast.success("Event details saved");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <WorkspaceRows>
      <WorkspaceRow step={1} title="Event title" description="The name and one-line tagline shown on the event page and in Explore.">
        <input
          type="text"
          aria-label="Event title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className={workspaceField.input}
          placeholder="e.g. Masterclass in Generative AI Architecture"
        />
        <input
          type="text"
          aria-label="Tagline"
          value={form.subtitle}
          onChange={(e) => set("subtitle", e.target.value)}
          className={`${workspaceField.input} mt-1.5`}
          placeholder="Tagline, e.g. Practical hands-on workshop building agents from scratch"
        />
      </WorkspaceRow>

      <WorkspaceRow step={2} title="About this event" description="What participants will learn, prerequisites and the agenda.">
        <textarea
          aria-label="Description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={workspaceField.textarea}
          placeholder="Detailed description of what participants will learn, prerequisites, and agenda..."
        />
      </WorkspaceRow>

      <WorkspaceRow step={3} title="Category & tags" description="Help learners find this event in Explore. Separate tags with commas.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <WorkspaceLabel htmlFor="event-category">Category</WorkspaceLabel>
            <select id="event-category" value={form.category} onChange={(e) => set("category", e.target.value)} className={workspaceField.select}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <WorkspaceLabel htmlFor="event-tags">Tags</WorkspaceLabel>
            <input
              id="event-tags"
              type="text"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              className={workspaceField.input}
              placeholder="e.g. AI, LLM, Python"
            />
          </div>
        </div>
      </WorkspaceRow>

      <WorkspaceRow step={4} title="Event type" description="The format participants should expect.">
        <WorkspaceChoice
          value={form.eventType}
          onChange={(v) => set("eventType", v)}
          options={[
            { value: EventType.WORKSHOP, label: "Workshop" },
            { value: EventType.WEBINAR, label: "Webinar" },
            { value: EventType.BOOTCAMP, label: "Bootcamp" },
            { value: EventType.MASTERCLASS, label: "Masterclass" },
            { value: EventType.AMA, label: "AMA" },
          ]}
        />
      </WorkspaceRow>

      <WorkspaceRow step={5} title="Delivery mode" description="Where and how the sessions happen.">
        <WorkspaceChoice
          value={form.deliveryMode}
          onChange={(v) => set("deliveryMode", v)}
          options={[
            { value: DeliveryMode.ONLINE, label: "Online live" },
            { value: DeliveryMode.OFFLINE, label: "In person" },
            { value: DeliveryMode.HYBRID, label: "Hybrid" },
            { value: DeliveryMode.RECORDED, label: "Recorded" },
          ]}
        />
      </WorkspaceRow>

      <WorkspaceRow step={6} title="Level & language" description="Who the event is pitched at, and the language it is taught in.">
        <div className="flex flex-col gap-3">
          <WorkspaceChoice
            value={form.difficulty}
            onChange={(v) => set("difficulty", v)}
            options={[Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED].map((lvl) => ({
              value: lvl,
              label: lvl.charAt(0) + lvl.slice(1).toLowerCase(),
            }))}
          />
          <select aria-label="Language" value={form.language} onChange={(e) => set("language", e.target.value)} className={workspaceField.select}>
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </WorkspaceRow>

      <WorkspaceRow step={7} title="Visibility" description="Whether the event is listed for anyone to find.">
        <WorkspaceChoice
          value={form.visibility}
          onChange={(v) => set("visibility", v)}
          options={[
            { value: Visibility.PUBLIC, label: "Public", hint: "Listed in Explore and open for anyone to register." },
            { value: Visibility.PRIVATE, label: "Private", hint: "Only registered members and people with the link can view or join." },
          ]}
        />
      </WorkspaceRow>

      <WorkspaceSaveBar onSave={save} saving={saving} dirty={dirty} label="Save details" savedLabel="Details saved" />
    </WorkspaceRows>
  );
}
