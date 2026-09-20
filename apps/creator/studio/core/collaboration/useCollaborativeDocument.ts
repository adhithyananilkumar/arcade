"use client";

// The one Hocuspocus/Y.Doc connection hook every Studio content type uses for real-time
// collaboration — moved here (out of apps/creator/editor, which is Tiptap-specific) so a
// content type with no rich text at all (Course/Event metadata, an exam question's structured
// fields) can get the same live-collaboration transport without depending on the Tiptap editor
// package. useArcadeEditor (Tiptap) is now a specialization built on top of this, not a
// duplicate of it.

import { HocuspocusProvider } from "@hocuspocus/provider";
import { useEffect, useMemo, useState } from "react";
import * as Y from "yjs";
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

export function useCollaborativeDocument({
  ownerType,
  ownerId,
  ydoc: externalYDoc,
}: UseCollaborativeDocumentOptions): UseCollaborativeDocumentResult {
  const { user, accessToken } = useAuthStore();

  const ownYDoc = useMemo(() => createYDoc(), []);
  const ydoc = externalYDoc ?? ownYDoc;

  const documentName = ownerId ? `${ownerType}:${ownerId}` : undefined;

  const provider = useMemo(() => {
    if (!documentName || typeof window === "undefined") return null;
    return new HocuspocusProvider({
      url: COLLAB_WS_URL,
      name: documentName,
      token: accessToken || undefined,
      document: ydoc,
      onAuthenticationFailed: (data) => {
        console.warn("[Collaboration] Hocuspocus authentication failed:", data.reason);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentName, accessToken, ydoc]);

  const [status, setStatus] = useState<CollabStatus>(documentName ? "connecting" : "disabled");
  const [collaborators, setCollaborators] = useState<ActiveCollaborator[]>([]);

  useEffect(() => {
    if (!provider) {
      setStatus("disabled");
      setCollaborators([]);
      return;
    }

    const updateStatus = ({ status: s }: { status: string }) => setStatus(s as CollabStatus);
    const updateAwareness = () => {
      if (!provider.awareness) return;
      const states = provider.awareness.getStates();
      const users: ActiveCollaborator[] = [];
      states.forEach((state: any, clientId: number) => {
        if (state.user) users.push({ clientId, user: state.user });
      });
      setCollaborators(users);
    };

    // Broadcast who's editing — the same awareness payload useArcadeEditor sets for Tiptap rooms.
    if (provider.awareness && user) {
      provider.awareness.setLocalStateField("user", { id: user.id, name: user.fullName });
    }

    provider.on("status", updateStatus);
    if (provider.awareness) {
      provider.awareness.on("change", updateAwareness);
      updateAwareness();
    }

    return () => {
      provider.off("status", updateStatus);
      if (provider.awareness) {
        provider.awareness.off("change", updateAwareness);
      }
      provider.destroy();
    };
  }, [provider, user]);

  return { ydoc, provider, status, collaborators };
}
