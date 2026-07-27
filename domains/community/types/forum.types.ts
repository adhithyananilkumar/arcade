// Clean from-scratch Social Forum types

export type ReactionType = 'LIKE' | 'UPVOTE' | 'HEART' | 'CELEBRATE' | 'INSIGHTFUL';

export interface PostResponse {
  id: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  authorId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
  currentUserLikeType?: string;
  createdAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  mediaUrl?: string;
  mediaUrls?: string[];
}

export interface CommentResponse {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface LikeRequest {
  likeType?: ReactionType | string;
}

export interface PagedPostResponse {
  content: PostResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
