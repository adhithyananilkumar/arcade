import { api } from "@/infrastructure/http/api";

export interface ReviewRoundResponse {
  id: string;
  courseId: string;
  reviewNumber: number;
  reviewType: string;
  versionId: string;
  versionNumber: number;
  submittedById: string;
  submittedByName: string;
  submittedAt: string;
  reviewerId?: string;
  reviewerName?: string;
  status: string; // PENDING, COMPLETED, CANCELLED
  decision?: string; // APPROVED, CHANGES_REQUESTED
  decisionReason?: string;
  resolvedAt?: string;
  snapshotCreatedAt?: string;
}

export interface ReviewCommentResponse {
  id: string;
  reviewRoundId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  targetType?: string;
  targetId?: string;
  parentCommentId?: string;
  content: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseResponse {
  id: string;
  title: string;
  status: string;
  // ... other fields as needed
}

export interface ReviewWorkspaceResponse {
  reviewRound: ReviewRoundResponse;
  course: CourseResponse;
  courseVersionSnapshot: string;
  previousCourseVersionSnapshot?: string;
  comments: ReviewCommentResponse[];
  timeline: ReviewRoundResponse[];
}

export interface PlatformReviewResponse {
  id: string;
  title: string;
  channelId: string;
  channelName: string;
  authorName: string;
  submittedAt: string;
  reviewRoundId: string;
  versionId: string;
  versionNumber: number;
  reviewNumber: number;
}

export const ReviewApi = {
  listPendingReviews: async (): Promise<PlatformReviewResponse[]> => {
    return api.get("/api/platform/reviews/courses");
  },

  getReviewWorkspace: async (roundId: string): Promise<ReviewWorkspaceResponse> => {
    return api.get(`/api/platform/reviews/rounds/${roundId}/workspace`);
  },

  approveRound: async (roundId: string): Promise<ReviewRoundResponse> => {
    return api.post(`/api/platform/reviews/rounds/${roundId}/approve`);
  },

  requestChanges: async (roundId: string, reason: string): Promise<ReviewRoundResponse> => {
    return api.post(`/api/platform/reviews/rounds/${roundId}/request-changes`, { reason });
  },

  addComment: async (roundId: string, content: string): Promise<ReviewCommentResponse> => {
    return api.post(`/api/platform/reviews/rounds/${roundId}/comments`, { content });
  }
};
