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

export interface ContentMeta {
  id: string;
  title: string;
  description: string;
  status: string;
  pricingModel?: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Terminology {
  root: string; // e.g. "Course", "Workshop"
  container: string; // e.g. "Module", "Workshop Section"
  leafDocument: string; // e.g. "Lesson", "Session"
  leafQuiz: string; // e.g. "Quiz", "Assessment"
}

export interface ContentDataAdapter {
  terminology: Terminology;
  
  // Initialization
  loadContent(id: string): Promise<{ meta: ContentMeta; containers: ContainerNode[] }>;
  
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
}
