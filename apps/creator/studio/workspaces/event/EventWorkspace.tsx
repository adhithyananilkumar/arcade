"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Creator
 * Type: Workspace
 *
 * Purpose:
 * The Event content workspace — Event's own adapter, day-schedule dialog, and submit/back
 * behaviour, running the shared lesson/module/badge editing engine.
 * ------------------------------------------------------------------
 */

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { StudioIconAction } from "@/apps/creator/studio/core/StudioHeader";
import { ContentEditorRuntime, type ContentEditorRuntimeHandle } from "@/apps/creator/studio/workspaces/content/ContentEditorRuntime";
import { EventAdapter } from "@/apps/creator/studio/workspaces/content/adapters/EventAdapter";
import { SessionSettingsDialog } from "./SessionSettingsDialog";

/**
 * EventWorkspace owns exactly what is Event-specific: which adapter to hand the shared runtime,
 * the day-schedule dialog and the header controls that open it. Everything else — the tree, the
 * lesson editor, history, collaboration, exams — is the runtime's job.
 *
 * <p>Event's containers are "Days" (event sessions with a schedule), which is why this is the one
 * workspace that needs a dialog beyond what Course needs: creating or opening a Day means editing
 * its date/time/location, not just naming it. That dialog is Event's own; the runtime never knows
 * it exists — it only knows a container was created (`onContainerCreated`) and exposes a way to
 * update a container's cached title afterwards (`ContentEditorRuntimeHandle`).
 */
export function EventWorkspace({ eventId }: { eventId: string }) {
  const router = useRouter();
  const adapter = useMemo(() => new EventAdapter(eventId), [eventId]);
  const runtimeRef = useRef<ContentEditorRuntimeHandle>(null);

  const [sessionSettingsSessionId, setSessionSettingsSessionId] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (data: { coverImageUrl?: string; pricingModel?: "FREE" | "PAID"; priceAmount?: number; message?: string }) => {
      const { submitEvent } = await import("@/app/(authenticated)/studio/events/api/publish");
      const updated = await submitEvent(eventId, { message: data.message });
      return { status: updated.status, updatedAt: updated.updatedAt ?? null };
    },
    [eventId]
  );

  return (
    <ContentEditorRuntime
      ref={runtimeRef}
      adapter={adapter}
      contentId={eventId}
      // Preserves the exact pre-existing behaviour: Event's back button returns to the Studio
      // root rather than an event content-overview page. Not something this migration changes —
      // see the workspace's own class docs if that ever needs revisiting.
      backHref="/studio"
      onSubmit={onSubmit}
      copy={{
        noContainers: "Create your first workshop day.",
        canvasTitle: "Select a workshop day or create a new day to start editing.",
        canvasDescription: "Create your first workshop day and start building the agenda, notes, resources, and instructions.",
      }}
      onContainerCreated={(container) => {
        // Auto-open Day Settings right after creating one, so the creator sets its schedule
        // details immediately rather than discovering the icon later.
        setSessionSettingsSessionId(container.id);
      }}
      headerExtras={({ activeLessonId, activeModuleId }) => ({
        beforeSubmit: activeLessonId && activeModuleId && (
          <StudioIconAction onClick={() => setSessionSettingsSessionId(activeModuleId)} title="Day Schedule & Settings">
            <Settings size={16} />
          </StudioIconAction>
        ),
        afterSubmit: (
          <button
            type="button"
            onClick={() => router.push(`/studio/events/${eventId}`)}
            className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="hidden sm:inline">Manage</span>
          </button>
        ),
      })}
      extraDialogs={
        <SessionSettingsDialog
          open={!!sessionSettingsSessionId}
          onClose={() => setSessionSettingsSessionId(null)}
          eventId={eventId}
          sessionId={sessionSettingsSessionId}
          onSaved={(updatedSession) => {
            if (updatedSession.title && sessionSettingsSessionId) {
              runtimeRef.current?.renameContainerLocally(sessionSettingsSessionId, updatedSession.title);
            }
            // Dialog closes itself via its own onClose prop after calling onSaved.
          }}
        />
      }
    />
  );
}
