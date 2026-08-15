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
}
