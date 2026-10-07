export interface LeafNode {
  id: string;
  title: string;
  type: "document" | "quiz" | "external";
  body?: string;
  position: number;
}

export interface ContainerNode {
  id: string;
  title: string;
  position: number;
  expanded: boolean;
  leaves: LeafNode[];
}

/**
 * A Badge is a root-level content item (a sibling of Modules in the Studio tree), never a Module
 * child — see backend Badge.java class docs for why. Kept separate from LeafNode/ContainerNode
 * rather than forcing it into either shape.
 */
export interface RootBadgeNode {
  id: string;
  title: string;
  position: number;
}

export interface ContentMeta {
  id: string;
  title: string;
  description: string;
  status: string;
  pricingModel?: string;
  categoryId?: string | null;
  /** Free-text category (Events). Courses use `categoryId` instead. */
  category?: string;
  learningOutcomes?: string;
  /** Minor units (paise). */
  priceAmount?: number;
  createdAt: string | null;
  updatedAt: string | null;
  raw?: any;
}

export interface Terminology {
  root: string; // e.g. "Course", "Event"
  container: string; // e.g. "Module", "Event Section"
  leafDocument: string; // e.g. "Lesson", "Session"
  leafQuiz: string; // e.g. "Quiz", "Assessment"
  leafBadge?: string; // e.g. "Badge" — omitted where the root type doesn't support badges
}

export interface ContentDataAdapter {
  terminology: Terminology;

  /**
   * Studio Core's Team-tab endpoint for this content item — the one collaborator system every
   * owner type shares (`/api/v1/content/{ownerType}/{id}/collaborators`, see backend
   * ContentCollaborationController). Each adapter supplies its own ownerType so
   * ContentEditorRuntime never has to branch on "which content type is this" to build the URL.
   */
  collaboratorsPath(contentId: string): string;

  // Initialization
  loadContent(id: string): Promise<{ meta: ContentMeta; containers: ContainerNode[]; badges: RootBadgeNode[] }>;

  // Settings
  updateMeta(id: string, patch: Partial<ContentMeta>): Promise<void>;
  deleteContent(id: string, confirmTitle: string): Promise<void>;

  // Tree mutations
  addContainer(contentId: string, title: string): Promise<ContainerNode>;
  deleteContainer(containerId: string): Promise<void>;
  renameContainer(containerId: string, title: string): Promise<void>;

  addLeaf(containerId: string, title: string, type: LeafNode["type"]): Promise<LeafNode>;
  deleteLeaf(leafId: string, type: LeafNode["type"]): Promise<void>;
  renameLeaf(leafId: string, title: string, type: LeafNode["type"]): Promise<void>;

  // Editor
  getLeafDocument(leafId: string): Promise<{ ydocState: string | null; body: string | null } | null>;
  saveLeafDocument(leafId: string, payload: { ydocState: string; body: string }): Promise<void>;
  saveLeafVersion(leafId: string, payload: { snapshot?: string; body: string; kind: string; label?: string }): Promise<void>;

  // Root-level badges — optional: only content types that support Badge implement these
  // (today: Course only). See RootBadgeNode.
  addBadge?(contentId: string, title: string): Promise<RootBadgeNode>;
  deleteBadge?(badgeId: string): Promise<void>;
  renameBadge?(badgeId: string, title: string): Promise<void>;

  // Assessments placed inside this content item's containers — "Add assessment" next to "Add
  // lesson". An assessment is an exam placed at a location, so these are placement operations, not
  // exam CRUD: removing one never deletes the exam, which may be placed elsewhere too.
  //
  // Optional, like badges: a content type whose containers cannot host assessments yet (Event days,
  // whose lesson positions are densely renumbered on delete) simply doesn't implement them, and the
  // runtime hides the affordance rather than offering something that would fail.
  listContainerAssessments?(contentId: string): Promise<AssessmentLeaf[]>;
  /**
   * Whether this content item already has the exam its assessments run on — asked *before* adding
   * one, so the first assessment can explain the arrangement rather than silently provisioning an
   * exam behind a menu click. Null means "not set up yet".
   */
  findAssessmentExam?(contentId: string): Promise<{ id: string; title: string } | null>;
  /** Sets the content item up for assessments. Idempotent. */
  createAssessmentExam?(contentId: string): Promise<{ id: string; title: string }>;
  /**
   * Adds an assessment to this container: a new plan on the content item's single exam, placed
   * here. `contentId` is passed because the exam belongs to the content item, not the container.
   */
  addContainerAssessment?(
    containerId: string,
    title: string,
    contentId: string,
    planType?: "COMPLETION" | "ASSESSMENT"
  ): Promise<AssessmentLeaf>;
  removeContainerAssessment?(placementId: string, planId: string | null): Promise<void>;

  // The exam tied to this content item — at most one. It is the content's assessment system: its
  // completion and assessment plans are placed inside the content, and its certification plan is
  // listed in Explore > Exams with this content as the prerequisite.
  listExams(contentId: string): Promise<ExamSummary[]>;
  /** Creates this content's exam (idempotent) and returns it. */
  createAndAttachExam(contentId: string, title: string): Promise<ExamSummary>;
  /** Unties the exam: it becomes standalone and its placements here are removed. */
  detachExam(contentId: string, examId: string): Promise<void>;
}

/**
 * An assessment sitting inside a container, as the authoring tree needs it. Its `position` shares
 * one space with that container's lessons, so it can be ordered between two of them.
 */
export interface AssessmentLeaf {
  /** The placement's id — what you remove. Distinct from `examId`, which is what you edit. */
  id: string;
  /** The course's single exam content item. Every assessment in the course shares it. */
  examId: string;
  /**
   * The plan this assessment delivers — what actually differs between a module quiz, the course
   * final and a certification sitting. All three are plans on the same exam and question bank.
   */
  planId: string | null;
  containerId: string;
  title: string;
  position: number;
  /** COMPLETION completes the content when passed; ASSESSMENT is a graded or practice check. */
  planType: "COMPLETION" | "ASSESSMENT";
  /** Serialized Tiptap document shown to candidates above the Start button; null until written. */
  instructions?: string | null;
}

/** The minimal shape the shared runtime's sidebar needs for an attached exam. */
export interface ExamSummary {
  id: string;
  title: string;
  published: boolean;
  questionCount?: number;
}
