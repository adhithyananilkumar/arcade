"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "@/infrastructure/http/api";
import type { Collaborator } from "@/app/(authenticated)/studio/events/api/collaboration";
import type { ContentStatusHistoryResponse } from "@/domains/publishing";

/**
 * Everything the Studio's right-hand panel needs: status history, the collaborator list, and the
 * invite/remove flow — for any content type.
 *
 * <p>This lived inline in the course/event orchestrator, which is the reason the exam editor
 * shipped without a right panel at all: adopting it would have meant copying ~120 lines of state,
 * two debounced effects and four handlers. As a hook it is one call, so a new content type gets
 * the same collaboration surface by default rather than by effort.
 *
 * The only per-type knowledge is the two API base paths, passed in — everything else is identical
 * across Course, Event and Exam, which is exactly why it belongs here and not in three editors.
 */
export interface StudioWorkflowPanelPaths {
  /** Collection endpoint for this content's collaborators, e.g. `/api/v1/courses/{id}/collaborators`. */
  collaboratorsPath: string | null;
  /** Status-history endpoint, e.g. `/api/courses/{id}/status-history`. Null when the type has none. */
  statusHistoryPath: string | null;
}

export type InviteRole = "EDITOR" | "MANAGER" | "VIEWER";

export function useStudioWorkflowPanel({ collaboratorsPath, statusHistoryPath }: StudioWorkflowPanelPaths) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<string>("status");

  const [statusHistory, setStatusHistory] = useState<ContentStatusHistoryResponse[]>([]);
  const [statusHistoryLoading, setStatusHistoryLoading] = useState(false);
  const [statusHistoryError, setStatusHistoryError] = useState<string | null>(null);

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("EDITOR");
  const [userSearchResults, setUserSearchResults] = useState<
    Array<{ id: string; label: string; avatarUrl: string | null }>
  >([]);
  const [inviting, setInviting] = useState(false);

  const loadCollaborators = useCallback(async () => {
    if (!collaboratorsPath) return;
    setLoadingCollaborators(true);
    try {
      const data = await api.get<Collaborator[]>(collaboratorsPath);
      setCollaborators(data || []);
    } catch (e) {
      console.error("Failed to load collaborators", e);
    } finally {
      setLoadingCollaborators(false);
    }
  }, [collaboratorsPath]);

  const loadStatusHistory = useCallback(async () => {
    if (!statusHistoryPath) return;
    setStatusHistoryLoading(true);
    setStatusHistoryError(null);
    try {
      const data = await api.get<ContentStatusHistoryResponse[]>(statusHistoryPath);
      setStatusHistory(data ?? []);
    } catch (e) {
      setStatusHistoryError(e instanceof Error ? e.message : "Failed to load status history");
    } finally {
      setStatusHistoryLoading(false);
    }
  }, [statusHistoryPath]);

  // Both lists load lazily, on the tab that shows them: opening the panel on Status must not fire
  // a collaborator request nobody is looking at.
  useEffect(() => {
    if (open && tab === "collab") loadCollaborators();
  }, [open, tab, loadCollaborators]);

  useEffect(() => {
    if (open && tab === "status") loadStatusHistory();
  }, [open, tab, loadStatusHistory]);

  useEffect(() => {
    if (!inviteEmail || inviteEmail.length < 2) {
      setUserSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get<Array<{ id: string; label: string; avatarUrl: string | null }>>(
          `/api/v1/users/search?q=${encodeURIComponent(inviteEmail)}`
        );
        setUserSearchResults(res || []);
      } catch {
        setUserSearchResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [inviteEmail]);

  const addCollaborator = useCallback(
    async (emailToAdd?: string) => {
      const email = (emailToAdd || inviteEmail).trim();
      if (!email || !collaboratorsPath) return;
      setInviting(true);
      try {
        await api.post<Collaborator>(collaboratorsPath, { email, role: inviteRole });
        toast.success(`Added ${email} as collaborator`);
        setInviteEmail("");
        setUserSearchResults([]);
        setShowAddForm(false);
        await loadCollaborators();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add collaborator");
      } finally {
        setInviting(false);
      }
    },
    [collaboratorsPath, inviteEmail, inviteRole, loadCollaborators]
  );

  const removeCollaborator = useCallback(
    async (targetUserId: string, targetName: string) => {
      if (!collaboratorsPath) return;
      try {
        await api.delete<void>(`${collaboratorsPath}/${targetUserId}`);
        toast.success(`Removed ${targetName}`);
        await loadCollaborators();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to remove collaborator");
      }
    },
    [collaboratorsPath, loadCollaborators]
  );

  /** Spread straight onto {@code EditorRightSidebar} — keeps the wiring in one place. */
  const sidebarProps = useMemo(
    () => ({
      tab,
      onTabChange: setTab,
      onClose: () => setOpen(false),
      statusHistory,
      statusHistoryLoading,
      statusHistoryError,
      onRetryStatusHistory: loadStatusHistory,
      eventCollaborators: collaborators,
      loadingCollaborators,
      showAddForm,
      onShowAddFormChange: setShowAddForm,
      inviteEmail,
      onInviteEmailChange: setInviteEmail,
      inviteRole,
      onInviteRoleChange: setInviteRole,
      userSearchResults,
      inviting,
      onAddCollaborator: addCollaborator,
      onRemoveCollaborator: removeCollaborator,
    }),
    [
      tab,
      statusHistory,
      statusHistoryLoading,
      statusHistoryError,
      loadStatusHistory,
      collaborators,
      loadingCollaborators,
      showAddForm,
      inviteEmail,
      inviteRole,
      userSearchResults,
      inviting,
      addCollaborator,
      removeCollaborator,
    ]
  );

  return {
    open,
    setOpen,
    tab,
    setTab,
    sidebarProps,
    reloadCollaborators: loadCollaborators,
    reloadStatusHistory: loadStatusHistory,
  };
}
