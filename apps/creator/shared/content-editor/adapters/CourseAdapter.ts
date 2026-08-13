import { api } from "@/infrastructure/http/api";
import { ContentDataAdapter, ContentMeta, ContainerNode, LeafNode, Terminology } from "../types";
import type { CourseResponse, ModuleResponse, LessonResponse, QuizResponse } from "@/shared/types/api.types";

export class CourseAdapter implements ContentDataAdapter {
  terminology: Terminology = {
    root: "Course",
    container: "Module",
    leafDocument: "Lesson",
    leafQuiz: "Quiz",
    leafBadge: "Badge",
  };

  async loadContent(id: string): Promise<{ meta: ContentMeta; containers: ContainerNode[] }> {
    const course = await api.get<CourseResponse>(`/api/courses/${id}`);
    
    return {
      meta: {
        id: course.id,
        title: course.title,
        description: course.description ?? "",
        status: course.status,
        pricingModel: course.pricingModel,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        raw: course,
      },
      containers: course.modules.map((m) => ({
        id: m.id,
        title: m.title,
        position: m.position,
        expanded: true,
        leaves: [
          ...m.lessons.map((l) => ({ ...l, type: "document" as const })),
          ...(m.quizzes ?? []).map((q) => ({ ...q, type: "quiz" as const })),
          ...(m.badges ?? []).map((b) => ({ ...b, type: "badge" as const })),
        ],
      })),
    };
  }

  async updateMeta(id: string, patch: Partial<ContentMeta>): Promise<void> {
    await api.patch(`/api/courses/${id}`, patch);
  }

  async deleteContent(id: string, confirmTitle: string): Promise<void> {
    await api.delete(`/api/courses/${id}`, { confirmText: confirmTitle });
  }

  async addContainer(contentId: string, title: string): Promise<ContainerNode> {
    const m = await api.post<ModuleResponse>(`/api/courses/${contentId}/modules`, { title });
    return {
      id: m.id,
      title: m.title,
      position: m.position,
      expanded: true,
      leaves: [],
    };
  }

  async deleteContainer(containerId: string): Promise<void> {
    await api.delete(`/api/modules/${containerId}`);
  }

  async renameContainer(containerId: string, title: string): Promise<void> {
    await api.patch(`/api/modules/${containerId}`, { title });
  }

  async addLeaf(containerId: string, title: string, type: LeafNode["type"]): Promise<LeafNode> {
    if (type === "document") {
      const l = await api.post<LessonResponse>(`/api/modules/${containerId}/lessons`, { title });
      return { ...l, type: "document" };
    } else if (type === "badge") {
      const b = await api.post<{ id: string; title: string; position: number }>(
        `/api/modules/${containerId}/badges`,
        { title }
      );
      return { ...b, type: "badge" };
    } else {
      const q = await api.post<QuizResponse>(`/api/modules/${containerId}/quizzes`, { title });
      return { ...q, type: "quiz" };
    }
  }

  async deleteLeaf(leafId: string, type: LeafNode["type"]): Promise<void> {
    if (type === "document") {
      await api.delete(`/api/lessons/${leafId}`);
    } else if (type === "badge") {
      await api.delete(`/api/badges/${leafId}`);
    } else {
      await api.delete(`/api/quizzes/${leafId}`);
    }
  }

  async renameLeaf(leafId: string, title: string, type: LeafNode["type"]): Promise<void> {
    if (type === "document") {
      await api.patch(`/api/lessons/${leafId}`, { title });
    } else if (type === "badge") {
      await api.patch(`/api/badges/${leafId}`, { title });
    } else {
      await api.patch(`/api/quizzes/${leafId}`, { title });
    }
  }

  async getLeafDocument(leafId: string): Promise<{ ydocState: string | null; body: string | null } | null> {
    const res = await api.get<{ ydocState?: string; body: string } | null>(`/api/lessons/${leafId}/document`);
    if (!res) return null;
    return { ydocState: res.ydocState ?? null, body: res.body ?? null };
  }

  async saveLeafDocument(leafId: string, payload: { ydocState: string; body: string }): Promise<void> {
    await api.put(`/api/lessons/${leafId}/document`, payload);
  }

  // ── Badge-specific document access ──────────────────────────────────────────
  // Badge documents are structured JSON (BadgeDocument), not Tiptap/Yjs — they don't fit
  // getLeafDocument/saveLeafDocument's ydocState-shaped contract, so StandaloneBadgeEditor talks
  // to domains/badges/api.ts directly (getBadge/saveBadgeDocument) instead of going through this
  // adapter. See domains/badges/index.ts.

  async saveLeafVersion(leafId: string, payload: { snapshot?: string; body: string; kind: string; label?: string }): Promise<void> {
    await api.post(`/api/lessons/${leafId}/document/versions`, payload);
  }
}
