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
    container: "Workshop Days",
    leafDocument: "Day",
    leafQuiz: "Quiz",
  };

  private readonly DEFAULT_CONTAINER_ID = "default-schedule-container";

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
      containers: [
        {
          id: this.DEFAULT_CONTAINER_ID,
          title: "Schedule",
          position: 0,
          expanded: true,
          leaves: sessions.map((s, idx) => ({
            id: s.id,
            title: s.title,
            type: "document" as const,
            position: s.sessionNumber ?? idx,
          })),
        },
      ],
    };
  }

  async updateMeta(id: string, patch: Partial<ContentMeta>): Promise<void> {
    const workshopPatch: any = {
      title: patch.title,
      description: patch.description,
    };
    await api.patch(`/api/workshops/${id}`, workshopPatch);
  }

  async deleteContent(id: string, confirmTitle: string): Promise<void> {
    await api.delete(`/api/workshops/${id}`, { confirmText: confirmTitle });
  }

  async addContainer(contentId: string, title: string): Promise<ContainerNode> {
    throw new Error("Workshops do not support multiple containers/sections yet.");
  }

  async deleteContainer(containerId: string): Promise<void> {
    throw new Error("Cannot delete the default workshop schedule container.");
  }

  async renameContainer(containerId: string, title: string): Promise<void> {
    // Ignore rename since it's a mock container
  }

  async addLeaf(containerId: string, title: string, type: LeafNode["type"]): Promise<LeafNode> {
    if (type !== "document") {
      throw new Error("Workshops currently only support sessions (documents).");
    }

    const payload = {
      title,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: "09:00:00",
      endTime: "17:00:00",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      deliveryMode: "ONLINE"
    };

    const s = await api.post<WorkshopSession>(`/api/workshops/${this.workshopId}/sessions`, payload);
    return {
      id: s.id,
      title: s.title,
      type: "document",
      position: s.sessionNumber,
    };
  }

  async deleteLeaf(leafId: string, type: LeafNode["type"]): Promise<void> {
    await api.delete(`/api/workshops/sessions/${leafId}`);
  }

  async renameLeaf(leafId: string, title: string, type: LeafNode["type"]): Promise<void> {
    await api.patch(`/api/workshops/sessions/${leafId}`, { title });
  }

  async getLeafDocument(leafId: string): Promise<{ ydocState: string | null; body: string | null } | null> {
    const res = await api.get<{ ydocState?: string; body: string } | null>(`/api/workshops/sessions/${leafId}/document`);
    if (!res) return null;
    return { ydocState: res.ydocState ?? null, body: res.body ?? null };
  }

  async saveLeafDocument(leafId: string, payload: { ydocState: string; body: string }): Promise<void> {
    await api.put(`/api/workshops/sessions/${leafId}/document`, payload);
  }

  async saveLeafVersion(leafId: string, payload: { snapshot?: string; body: string; kind: string; label?: string }): Promise<void> {
    await api.post(`/api/workshops/sessions/${leafId}/document/versions`, payload);
  }
}
