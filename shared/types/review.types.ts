import { ReviewWorkspaceResponse } from "@/shared/api/review.api";

export interface ReviewWorkspaceState {
  workspace: ReviewWorkspaceResponse | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
}

export interface ReviewNotificationService {
  notifyApproval(roundId: string): Promise<void>;
  notifyChangesRequested(roundId: string): Promise<void>;
  notifyComment(roundId: string, commentId: string): Promise<void>;
}
