import { api } from "@/infrastructure/http/api";
import {
  AssessmentLeaf,
  ContentDataAdapter,
  ContentMeta,
  ContainerNode,
  ExamSummary,
  LeafNode,
  RootBadgeNode,
  Terminology,
} from "../types";
import type { CourseResponse, ModuleResponse, LessonResponse, QuizResponse, BadgeSummaryResponse } from "@/shared/types/api.types";
import {
  createExamPlan,
  deleteExamPlan,
  getCourseExam,
  createCourseExam,
  listAssessmentPlacementsForCourse,
  listExamPlans,
  placeAssessment,
  untieExam,
  updateAssessmentPlacement,
  updateExam,
} from "@/domains/assessments";

export class CourseAdapter implements ContentDataAdapter {
  terminology: Terminology = {
    root: "Course",
    container: "Module",
    leafDocument: "Lesson",
    leafQuiz: "Quiz",
    leafBadge: "Badge",
  };

  collaboratorsPath(contentId: string): string {
    return `/api/v1/content/COURSE/${contentId}/collaborators`;
  }

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
    const res = await api.get<{ ydocState?: string; body: string } | null>(`/api/documents/LESSON/${leafId}`);
    if (!res) return null;
    return { ydocState: res.ydocState ?? null, body: res.body ?? null };
  }

  async saveLeafDocument(leafId: string, payload: { ydocState: string; body: string }): Promise<void> {
    await api.put(`/api/documents/LESSON/${leafId}`, payload);
  }

  async saveLeafVersion(leafId: string, payload: { snapshot?: string; body: string; kind: string; label?: string }): Promise<void> {
    await api.post(`/api/documents/LESSON/${leafId}/versions`, payload);
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

  // ── The course's exam ─────────────────────────────────────────────────────────
  // A course has at most one exam. All of its assessments are plans on it and share its bank.

  async listExams(contentId: string): Promise<ExamSummary[]> {
    const exam = await getCourseExam(contentId);
    return exam ? [{ id: exam.id, title: exam.title, published: exam.published }] : [];
  }

  async createAndAttachExam(contentId: string, title: string): Promise<ExamSummary> {
    const exam = await createCourseExam(contentId);
    // A freshly created exam gets a meaningful name; an existing one keeps the author's.
    if (exam.planCount === 0 && title && exam.title !== title) {
      const renamed = await updateExam(exam.id, { title });
      return { id: renamed.id, title: renamed.title, published: renamed.published };
    }
    return { id: exam.id, title: exam.title, published: exam.published };
  }

  async detachExam(_contentId: string, examId: string): Promise<void> {
    await untieExam(examId);
  }

  // ── Assessments inside modules ────────────────────────────────────────────────
  // A module assessment is a plan on the course's exam, placed on that module. The placement is
  // what makes it appear in module 3 between two lessons.

  async listContainerAssessments(contentId: string): Promise<AssessmentLeaf[]> {
    const [placements, exam] = await Promise.all([
      listAssessmentPlacementsForCourse(contentId),
      getCourseExam(contentId),
    ]);
    const plans = exam ? await listExamPlans(exam.id) : [];
    const typeOf = new Map(plans.map((p) => [p.id, p.planType]));
    const nameOf = new Map(plans.map((p) => [p.id, p.name]));
    return placements
      .filter((p) => p.hostType === "COURSE_MODULE")
      .map((p) => ({
        id: p.id,
        examId: p.examId,
        containerId: p.hostId,
        planId: p.planId,
        title: p.titleOverride ?? nameOf.get(p.planId) ?? "Assessment",
        position: p.position,
        planType: typeOf.get(p.planId) === "COMPLETION" ? ("COMPLETION" as const) : ("ASSESSMENT" as const),
        instructions: p.instructions,
      }));
  }

  async findAssessmentExam(contentId: string): Promise<{ id: string; title: string } | null> {
    const exam = await getCourseExam(contentId);
    return exam ? { id: exam.id, title: exam.title } : null;
  }

  async createAssessmentExam(contentId: string): Promise<{ id: string; title: string }> {
    const exam = await createCourseExam(contentId);
    return { id: exam.id, title: exam.title };
  }

  /**
   * Adds a plan of the given type to the course's exam and places it on the module. The server
   * places every new in-content plan at the course root first; placing it here moves it.
   */
  async addContainerAssessment(
    containerId: string,
    title: string,
    contentId: string,
    planType: "COMPLETION" | "ASSESSMENT" = "ASSESSMENT"
  ): Promise<AssessmentLeaf> {
    const exam = await createCourseExam(contentId);
    const plan = await createExamPlan(exam.id, { planType, name: title });
    const placement = await placeAssessment({
      examId: exam.id,
      hostType: "COURSE_MODULE",
      hostId: containerId,
      planId: plan.id,
    });
    // The placement carries its own title so the tree keeps reading correctly even if the plan is
    // renamed from the Exam workspace later.
    await updateAssessmentPlacement(placement.id, { titleOverride: title });
    return {
      id: placement.id,
      examId: exam.id,
      planId: plan.id,
      containerId,
      title,
      position: placement.position,
      planType,
      instructions: placement.instructions,
    };
  }

  /** Deleting the plan removes its placement with it; the exam and its bank are untouched. */
  async removeContainerAssessment(_placementId: string, planId: string | null): Promise<void> {
    if (planId) await deleteExamPlan(planId);
  }
}
