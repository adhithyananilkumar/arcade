export interface RoadmapData {
  id: string;
  title: string;
  description: string;
  ownerType: string;
  ownerId: string;
  graphJson: string;
  version: number;
  status: 'draft' | 'review' | 'published' | 'archived';
  publishedAt?: string;
  publishedBy?: string;
  archivedAt?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapTemplateData {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  thumbnail: string;
  graphJson: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
}

export interface NodeProgressData {
  nodeId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
  startedAt?: string;
  completedAt?: string;
  timeSpentSeconds: number;
}

export interface RoadmapProgressData {
  roadmapId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completedNodesCount: number;
  startedAt?: string;
  completedAt?: string;
  nodes: NodeProgressData[];
}

export interface NodeAnalytics {
  nodeId: string;
  totalLearners: number;
  completedLearners: number;
  completionRate: number;
  averageTimeSpentSeconds: number;
}

export interface RoadmapAnalyticsData {
  totalLearners: number;
  activeLearners: number;
  completedLearners: number;
  completionRate: number;
  averageCompletionTimeSeconds: number;
  nodeStats: NodeAnalytics[];
}

export interface CollaboratorData {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: "OWNER" | "EDITOR" | "REVIEWER" | "VIEWER";
  status: "PENDING" | "ACCEPTED";
  joinedAt: string;
}

export interface CommentData {
  id: string;
  nodeId: string | null;
  userId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  resolved: boolean;
  createdAt: string;
}

export interface ActivityData {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  actionType: string;
  description: string;
  createdAt: string;
}
