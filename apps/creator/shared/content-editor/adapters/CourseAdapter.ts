import { api } from "@/infrastructure/http/api";
import { ContentDataAdapter, ContentMeta, ContainerNode, LeafNode, RootBadgeNode, Terminology } from "../types";
import type { CourseResponse, ModuleResponse, LessonResponse, QuizResponse, BadgeSummaryResponse } from "@/shared/types/api.types";

export class CourseAdapter implements ContentDataAdapter {
  terminology: Terminology = {
    root: "Course",
    container: "Module",
    leafDocument: "Lesson",
    leafQuiz: "Quiz",
    leafBadge: "Badge",
  };

  async loadContent(id: string): Promise<{ meta: ContentMeta; containers: ContainerNode[]; badges: RootBadgeNode[] }> {
    const course = await api.get<CourseResponse>(`/api/courses/${id}`);

    return {
      meta: {
        id: course.id,
        title: course.title,
        description: course.description ?? "",
        status: course.status,
        pricingModel: course.pricingModel,
        categoryId: course.categoryId ?? null,
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
        ],
      })),
      // Badge is a course-level content item — a sibling of modules, never nested inside one.
      badges: (course.badges ?? []).map((b: BadgeSummaryResponse) => ({
        id: b.id,
        title: b.title,
        position: b.position,
      })),
    };
  }

  async updateMeta(id: string, patch: Partial<ContentMeta>): Promise<void> {
    // categoryId goes through a dedicated endpoint: the generic patch below only ever sets a
    // field when it's non-null (see CourseAuthoringService.patchCourse), so it can never clear
    // categoryId back to null ("Other") — a separate endpoint sidesteps that ambiguity entirely.
    const { categoryId, ...rest } = patch;
    const requests: Promise<unknown>[] = [];
    if ("categoryId" in patch) {
      requests.push(api.patch(`/api/courses/${id}/category`, { categoryId: categoryId ?? null }));
    }
    if (Object.keys(rest).length > 0) {
      requests.push(api.patch(`/api/courses/${id}`, rest));
    }
    await Promise.all(requests);
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
    } else {
      const q = await api.post<QuizResponse>(`/api/modules/${containerId}/quizzes`, { title });
      return { ...q, type: "quiz" };
    }
  }

  async deleteLeaf(leafId: string, type: LeafNode["type"]): Promise<void> {
    if (type === "document") {
      await api.delete(`/api/lessons/${leafId}`);
    } else {
      await api.delete(`/api/quizzes/${leafId}`);
    }
  }

  async renameLeaf(leafId: string, title: string, type: LeafNode["type"]): Promise<void> {
    if (type === "document") {
      await api.patch(`/api/lessons/${leafId}`, { title });
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

  async saveLeafVersion(leafId: string, payload: { snapshot?: string; body: string; kind: string; label?: string }): Promise<void> {
    await api.post(`/api/lessons/${leafId}/document/versions`, payload);
  }

  // ── Root-level badges ────────────────────────────────────────────────────────
  // Badge documents are structured JSON (BadgeDocument), not Tiptap/Yjs — useBadgeEditor
  // talks to domains/badges/api.ts directly (getBadge/saveBadgeDocument) for document read/write.
  // These three cover only the course-tree placement lifecycle (create/rename/delete).

  async addBadge(contentId: string, title: string): Promise<RootBadgeNode> {
    const b = await api.post<{ id: string; title: string; position: number }>(
      `/api/courses/${contentId}/badges`,
      { title }
    );
    return { id: b.id, title: b.title, position: b.position };
  }

  async deleteBadge(badgeId: string): Promise<void> {
    await api.delete(`/api/badges/${badgeId}`);
  }

  async renameBadge(badgeId: string, title: string): Promise<void> {
    await api.patch(`/api/badges/${badgeId}`, { title });
  }
}
