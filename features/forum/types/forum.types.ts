// Enums
export type PostType = 'DISCUSSION' | 'QUESTION' | 'BLOG' | 'SHOWCASE' | 'POLL';
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'REMOVED' | 'LOCKED';
export type VoteType = 'UP' | 'DOWN';
export type TargetType = 'POST' | 'COMMENT';
export type FollowType = 'USER' | 'TAG';
export type NotificationType =
  | 'COMMENT_ON_POST'
  | 'REPLY_TO_COMMENT'
  | 'UPVOTE_ON_POST'
  | 'ANSWER_ACCEPTED'
  | 'NEW_FOLLOWER'
  | 'MENTION'
  | 'SHARE_COMMENT';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED';
export type CommentStatus = 'VISIBLE' | 'REMOVED';
export type BadgeLevel = 'NEWCOMER' | 'CONTRIBUTOR' | 'TRUSTED' | 'EXPERT';

// DTOs
export interface ForumUserSummary {
  id: string;
  username: string;
  avatarUrl?: string;
  reputationPoints: number;
}

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
}

export interface TagResponse {
  id: number;
  name: string;
  slug: string;
  postCount: number;
}

export interface PostSummaryResponse {
  id: number;
  title: string;
  slug: string;
  postType: PostType;
  status: PostStatus;
  author: ForumUserSummary;
  category?: CategoryResponse;
  tags: TagResponse[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  isFeatured: boolean;
  isBookmarked: boolean;
  userVote?: VoteType;
  body?: string;
  hasAcceptedAnswer?: boolean;
  createdAt: string;
  publishedAt?: string;
  editedAt?: string;
}

export interface PostDetailResponse extends PostSummaryResponse {
  body: string;
  hasAcceptedAnswer: boolean;
  acceptedAnswerId?: number;
}

export interface CommentResponse {
  id: number;
  body: string;
  author: ForumUserSummary;
  postId: number;
  parentId?: number;
  depth: number;
  upvotes: number;
  downvotes: number;
  isAcceptedAnswer: boolean;
  userVote?: VoteType;
  status: CommentStatus;
  replies: CommentResponse[];
  createdAt: string;
  editedAt?: string;
}

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  actor?: ForumUserSummary;
  postId?: number;
  postTitle?: string;
  commentId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface ReputationResponse {
  userId: string;
  totalPoints: number;
  postsCount: number;
  commentsCount: number;
  acceptedAnswersCount: number;
  badge: BadgeLevel;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface VoteResponse {
  targetId: number;
  targetType: TargetType;
  upvotes: number;
  downvotes: number;
  userVote?: VoteType;
}

export interface BookmarkResponse {
  postId: number;
  bookmarked: boolean;
}

export interface FollowResponse {
  following: boolean;
}

// Request types
export interface CreatePostRequest {
  title: string;
  body: string;
  postType: PostType;
  categoryId: number;
  tags: string[];
}

export interface UpdatePostRequest {
  title?: string;
  body?: string;
  categoryId?: number;
  tags?: string[];
}

export interface CreateCommentRequest {
  body: string;
  parentId?: number;
}

export interface UpdateCommentRequest {
  body: string;
}

export interface VoteRequest {
  voteType: VoteType;
}

export interface CreateTagRequest {
  name: string;
}

export interface ReportRequest {
  targetType: TargetType;
  targetId: number;
  reason: string;
}
