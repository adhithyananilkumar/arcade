import { api } from "@/infrastructure/http/api";
import { ContentDataAdapter, ContentMeta, ContainerNode, LeafNode } from "../types";
import type { Workshop, WorkshopSession } from "@/app/(authenticated)/studio/workshop/types";

export class WorkshopAdapter implements ContentDataAdapter {
  private workshopId: string;

  constructor(workshopId: string) {
    this.workshopId = workshopId;
  }

  terminology = {
    root: "Workshop",
    container: "Day",
    leafDocument: "Lesson",
    leafQuiz: "Quiz",
  };

  async loadContent(id: string): Promise<{ meta: ContentMeta; containers: ContainerNode[] }> {
    const [workshop, sessions] = await Promise.all([
      api.get<Workshop>(`/api/workshops/${id}`),
      api.get<WorkshopSession[]>(`/api/workshops/${id}/sessions`).catch(() => []),
    ]);

    return {
      meta: {
        id: workshop.id,
        title: workshop.title,
        description: workshop.description ?? "",
        status: workshop.status,
        pricingModel: workshop.price > 0 ? "PAID" : "FREE",
        createdAt: workshop.createdAt,
        updatedAt: workshop.updatedAt,
      },
      // Each session is a "Day" (container), its lessons are the leaves.
      containers: sessions.map((s, idx) => ({
        id: s.id,
        title: s.title,
        position: s.sessionNumber ?? idx,
        expanded: true,
        leaves: ((s as any).lessons ?? []).map((l: any, li: number) => ({
          id: l.id,
          title: l.title,
          type: "document" as const,
          position: l.position ?? li,
        })),
      })),
    };
  }

  async updateMeta(id: string, patch: Partial<ContentMeta>): Promise<void> {
    await api.patch(`/api/workshops/${id}`, {
      title: patch.title,
      description: patch.description,
    });
  }

  async deleteContent(id: string, confirmTitle: string): Promise<void> {
    await api.delete(`/api/workshops/${id}`, { confirmText: confirmTitle });
  }

  /** Add a new Day (WorkshopSession container). */
  async addContainer(contentId: string, title: string): Promise<ContainerNode> {
    const today = new Date().toISOString().split("T")[0];
    const s = await api.post<WorkshopSession>(`/api/workshops/${contentId}/sessions`, {
      title,
      startDate: today,
      endDate: today,
      startTime: "09:00:00",
      endTime: "17:00:00",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      deliveryMode: "ONLINE",
    });
    return {
      id: s.id,
      title: s.title,
      position: s.sessionNumber,
      expanded: true,
      leaves: [],
    };
  }

  async deleteContainer(containerId: string): Promise<void> {
    // containerId is a session id; workshopId is available on this instance
    await api.delete(`/api/workshops/${this.workshopId}/sessions/${containerId}`);
  }

  async renameContainer(containerId: string, title: string): Promise<void> {
    await api.patch(`/api/workshops/${this.workshopId}/sessions/${containerId}`, { title });
  }

  /** Add a new Lesson inside a Day (sessionId = containerId). */
  async addLeaf(containerId: string, title: string, type: LeafNode["type"]): Promise<LeafNode> {
    if (type !== "document") {
      throw new Error("Workshops currently only support lesson documents.");
    }
    const l = await api.post<{ id: string; title: string; position: number }>(
      `/api/workshops/sessions/${containerId}/lessons`,
      { title }
    );
    return {
      id: l.id,
      title: l.title,
      type: "document",
      position: l.position,
    };
  }

  async deleteLeaf(leafId: string, type: LeafNode["type"]): Promise<void> {
    // We need to delete by lesson id; find session id from the lesson endpoint isn't
    // straightforward, so we use the lesson-scoped delete path via a generic approach.
    // The backend accepts DELETE /api/workshops/sessions/{sessionId}/lessons/{lessonId}
    // but we don't have sessionId here — use a top-level lesson delete instead.
    // For now, search through containers is done at orchestrator level; here we trust the
    // orchestrator passes the right leafId. We expose a direct lesson endpoint:
    await api.delete(`/api/workshops/lessons/${leafId}`);
  }

  async renameLeaf(leafId: string, title: string, type: LeafNode["type"]): Promise<void> {
    await api.patch(`/api/workshops/lessons/${leafId}`, { title });
  }

  async getLeafDocument(leafId: string): Promise<{ ydocState: string | null; body: string | null } | null> {
    const res = await api.get<{ ydocState?: string; body: string } | null>(
      `/api/workshops/lessons/${leafId}/document`
    );
    if (!res) return null;
    return { ydocState: res.ydocState ?? null, body: res.body ?? null };
  }

  async saveLeafDocument(leafId: string, payload: { ydocState: string; body: string }): Promise<void> {
    await api.put(`/api/workshops/lessons/${leafId}/document`, payload);
  }

  async saveLeafVersion(
    leafId: string,
    payload: { snapshot?: string; body: string; kind: string; label?: string }
  ): Promise<void> {
    await api.post(`/api/workshops/lessons/${leafId}/document/versions`, payload);
  }
}
