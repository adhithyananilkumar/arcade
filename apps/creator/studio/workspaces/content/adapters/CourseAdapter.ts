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
  createExam,
  createExamPlan,
  getCourseExam,
  createCourseExam,
  detachExamFromCourse,
  listExamsForCourse,
  listAssessmentPlacementsForCourse,
  placeAssessment,
  removeAssessmentPlacement,
  updateAssessmentPlacement,
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

  // ── Exams attached to this course ─────────────────────────────────────────────

  async listExams(contentId: string): Promise<ExamSummary[]> {
    return listExamsForCourse(contentId);
  }

  async createAndAttachExam(contentId: string, title: string): Promise<ExamSummary> {
    return createExam({ title, courseId: contentId });
  }

  async detachExam(contentId: string, examId: string): Promise<void> {
    await detachExamFromCourse(contentId, examId);
  }

  // ── Assessments inside modules ────────────────────────────────────────────────
  // A module assessment is an exam placed on that module. The exam is created against the course
  // so it draws on the course's question bank; the placement is what makes it appear in module 3
  // between two lessons.

  async listContainerAssessments(contentId: string): Promise<AssessmentLeaf[]> {
    const placements = await listAssessmentPlacementsForCourse(contentId);
    return placements
      .filter((p) => p.hostType === "COURSE_MODULE")
      .map((p) => ({
        id: p.id,
        examId: p.examId,
        containerId: p.hostId,
        planId: p.planId,
        title: p.titleOverride ?? "Assessment",
        position: p.position,
        requiredForCompletion: p.requiredForCompletion,
        instructions: p.instructions,
      }));
  }

  /**
   * A course has one exam content item, and each assessment is a *plan* on it — not an exam of its
   * own. The exam owns the question bank; a plan owns how one sitting runs (its question selection,
   * timing, attempt allowance, pass mark, security and outcome). That is exactly the split plans
   * exist for, and it is what lets a module quiz, the course final and a certification sitting all
   * draw on the same bank while behaving completely differently.
   *
   * So placing an assessment is three steps: get (or create) the course's exam, add a plan named
   * after this assessment, and place that (exam, plan) pair on the module.
   */
  async findAssessmentExam(contentId: string): Promise<{ id: string; title: string } | null> {
    const exam = await getCourseExam(contentId);
    return exam ? { id: exam.id, title: exam.title } : null;
  }

  async createAssessmentExam(contentId: string): Promise<{ id: string; title: string }> {
    const exam = await createCourseExam(contentId);
    return { id: exam.id, title: exam.title };
  }

  async addContainerAssessment(
    containerId: string,
    title: string,
    contentId: string
  ): Promise<AssessmentLeaf> {
    // Created by now: the runtime sets the course up before it gets here the first time.
    const exam = await createCourseExam(contentId);
    const plan = await createExamPlan(exam.id, { name: title });
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
      requiredForCompletion: placement.requiredForCompletion,
      instructions: placement.instructions,
    };
  }

  async removeContainerAssessment(placementId: string): Promise<void> {
    // Removes the assessment from this module only — the exam itself survives, as it may be placed
    // in other courses and is a standalone content item in its own right.
    await removeAssessmentPlacement(placementId);
  }
}
