"use client";

// The one Hocuspocus/Y.Doc connection hook every Studio content type uses for real-time
// collaboration — moved here (out of apps/creator/editor, which is Tiptap-specific) so a
// content type with no rich text at all (Course/Event metadata, an exam question's structured
// fields) can get the same live-collaboration transport without depending on the Tiptap editor
// package. useArcadeEditor (Tiptap) is now a specialization built on top of this, not a
// duplicate of it.

import { HocuspocusProvider } from "@hocuspocus/provider";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import { toast } from "sonner";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { COLLAB_WS_URL } from "@/infrastructure/config/env";
import { createYDoc } from "./yjs";

export type CollabStatus = "disabled" | "connecting" | "connected" | "disconnected";

export interface ActiveCollaborator {
  clientId: number;
  user?: {
    id?: string;
    name?: string;
    color?: string;
  };
}

export interface UseCollaborativeDocumentOptions {
  /** The backend Document.OwnerType enum name, e.g. "COURSE_METADATA", "EXAM_QUESTION". */
  ownerType: string;
  /** The owning row's id. Connection is disabled (status "disabled") while this is null/undefined. */
  ownerId?: string | null;
  /** Reuse a caller-owned Y.Doc (e.g. one already hydrated from a REST fetch) instead of a fresh one. */
  ydoc?: Y.Doc;
}

export interface UseCollaborativeDocumentResult {
  ydoc: Y.Doc;
  provider: HocuspocusProvider | null;
  status: CollabStatus;
  collaborators: ActiveCollaborator[];
}

/**
 * Identity of the people in the room — what the collaborator list actually shows. Cursor positions
 * are deliberately left out: they change on every keystroke, and the list doesn't display them.
 */
function collaboratorsKey(users: ActiveCollaborator[]): string {
  return users.map((u) => `${u.clientId}:${u.user?.id ?? ""}:${u.user?.name ?? ""}:${u.user?.color ?? ""}`).join("|");
}

export function useCollaborativeDocument({
  ownerType,
  ownerId,
  ydoc: externalYDoc,
}: UseCollaborativeDocumentOptions): UseCollaborativeDocumentResult {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const userName = user?.fullName;
  // Read inside listeners rather than as effect dependencies: the auth store hands out a new
  // `user` object on every refresh, and re-running the effect for that destroyed the provider.
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const ownYDoc = useMemo(() => createYDoc(), []);
  const ydoc = externalYDoc ?? ownYDoc;

  const documentName = ownerId ? `${ownerType}:${ownerId}` : undefined;

  const handleRevocation = (message?: string) => {
    setStatus("disconnected");
    setCollaborators([]);
    try {
      provider?.disconnect();
      provider?.destroy();
    } catch (e) {
      // ignore
    }
    toast.error(message || "Your collaborator access has been revoked. Exiting workspace...", {
      id: "collaborator-revoked-exit",
      duration: 4000,
    });
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.replace("/studio");
      }
    }, 300);
  };

  const provider = useMemo(() => {
    if (!documentName || typeof window === "undefined") return null;
    return new HocuspocusProvider({
      url: COLLAB_WS_URL,
      name: documentName,
      // Read at every (re)connect, so a refreshed access token is picked up without rebuilding the
      // provider. Rebuilding it on each refresh reconnected the socket and remounted the editor
      // mid-sentence.
      token: () => useAuthStore.getState().accessToken || "",
      document: ydoc,
      onAuthenticationFailed: (data) => {
        console.warn("[Collaboration] Hocuspocus authentication failed:", data.reason);
        handleRevocation("You no longer have permission to edit this content. Exiting...");
      },
      onClose: ({ event }) => {
        if (event?.code === 4403 || event?.code === 4401) {
          handleRevocation();
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentName, ydoc]);

  const [status, setStatus] = useState<CollabStatus>(documentName ? "connecting" : "disabled");
  const [collaborators, setCollaborators] = useState<ActiveCollaborator[]>([]);

  useEffect(() => {
    if (!provider) {
      setStatus("disabled");
      setCollaborators([]);
      return;
    }

    const updateStatus = ({ status: s }: { status: string }) => setStatus(s as CollabStatus);
    // Awareness fires on every cursor move — including our own caret on each keystroke. Only a
    // change in *who* is here updates React state; otherwise every keystroke re-rendered the
    // editor and, through onCollabStateChange, the whole Studio workspace around it.
    let lastKey = "";
    const updateAwareness = () => {
      if (!provider.awareness) return;
      const states = provider.awareness.getStates();
      const users: ActiveCollaborator[] = [];
      states.forEach((state: any, clientId: number) => {
        if (state.user) users.push({ clientId, user: state.user });
      });
      const key = collaboratorsKey(users);
      if (key === lastKey) return;
      lastKey = key;
      setCollaborators(users);
    };

    const handleAuthFailed = () => {
      handleRevocation();
    };

    const handleClose = ({ event }: { event?: any }) => {
      if (event?.code === 4403 || event?.code === 4401) {
        handleRevocation();
      }
    };

    const handleStateless = ({ payload }: { payload: string }) => {
      try {
        const msg = JSON.parse(payload);
        const currentUserId = userIdRef.current ? String(userIdRef.current).toLowerCase() : null;
        const targetUserId = msg.userId ? String(msg.userId).toLowerCase() : null;

        if (
          (msg.type === "ACCESS_REVOKED" && (!targetUserId || targetUserId === currentUserId)) ||
          (msg.type === "COLLABORATOR_REMOVED" && (!targetUserId || targetUserId === currentUserId))
        ) {
          handleRevocation();
        }
      } catch (e) {
        // ignore non-json
      }
    };

    provider.on("status", updateStatus);
    provider.on("authenticationFailed", handleAuthFailed);
    provider.on("close", handleClose);
    provider.on("stateless", handleStateless);
    if (provider.awareness) {
      provider.awareness.on("change", updateAwareness);
      updateAwareness();
    }

    return () => {
      provider.off("status", updateStatus);
      provider.off("authenticationFailed", handleAuthFailed);
      provider.off("close", handleClose);
      provider.off("stateless", handleStateless);
      if (provider.awareness) {
        provider.awareness.off("change", updateAwareness);
      }
      provider.destroy();
    };
  }, [provider]);

  // Broadcast who's editing — the same awareness payload useArcadeEditor sets for Tiptap rooms.
  // Separate from the effect above so a profile/name change updates the payload without
  // tearing the connection down.
  useEffect(() => {
    if (provider?.awareness && userId) {
      // Merged, not replaced: the Tiptap cursor extension puts the author's cursor colour here.
      const current = provider.awareness.getLocalState()?.user ?? {};
      provider.awareness.setLocalStateField("user", { ...current, id: userId, name: userName });
    }
  }, [provider, userId, userName]);

  return { ydoc, provider, status, collaborators };
}
