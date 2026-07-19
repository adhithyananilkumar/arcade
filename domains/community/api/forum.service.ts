import { api } from '@/infrastructure/http/api';
import type {
  BookmarkResponse,
  CategoryResponse,
  CommentResponse,
  CreateCommentRequest,
  CreatePostRequest,
  CreateTagRequest,
  FollowResponse,
  NotificationResponse,
  PagedResponse,
  PostDetailResponse,
  PostSummaryResponse,
  ReportRequest,
  ReputationResponse,
  TagResponse,
  TargetType,
  UpdateCommentRequest,
  UpdatePostRequest,
  VoteRequest,
  VoteResponse,
} from '../types/forum.types';

const BASE = '/forum';

export class ForumService {
  // --- Posts ---
  static async getFeed(feedType = 'latest', page = 0, size = 20) {
    const data = await api.get<PagedResponse<PostSummaryResponse>>(
      `${BASE}/posts?feedType=${feedType}&page=${page}&size=${size}`
    );
    return data;
  }

  static async getPostBySlug(slug: string) {
    const data = await api.get<PostDetailResponse>(`${BASE}/posts/${slug}`);
    return data;
  }

  static async getPostsByCategory(slug: string, page = 0, size = 20) {
    const data = await api.get<PagedResponse<PostSummaryResponse>>(
      `${BASE}/posts/category/${slug}?page=${page}&size=${size}`
    );
    return data;
  }

  static async getPostsByTag(tagSlug: string, page = 0, size = 20) {
    const data = await api.get<PagedResponse<PostSummaryResponse>>(
      `${BASE}/posts/tag/${tagSlug}?page=${page}&size=${size}`
    );
    return data;
  }

  static async getPostsByAuthor(authorId: string, page = 0, size = 20) {
    const data = await api.get<PagedResponse<PostSummaryResponse>>(
      `${BASE}/posts/author/${authorId}?page=${page}&size=${size}`
    );
    return data;
  }

  static async createPost(payload: CreatePostRequest) {
    const data = await api.post<PostDetailResponse>(`${BASE}/posts`, payload);
    return data;
  }

  static async updatePost(postId: number, payload: UpdatePostRequest) {
    const data = await api.put<PostDetailResponse>(`${BASE}/posts/${postId}`, payload);
    return data;
  }

  static async deletePost(postId: number) {
    await api.delete(`${BASE}/posts/${postId}`);
  }

  // --- Comments ---
  static async getComments(postId: number, page = 0, size = 20) {
    const data = await api.get<PagedResponse<CommentResponse>>(
      `${BASE}/posts/${postId}/comments?page=${page}&size=${size}`
    );
    return data;
  }

  static async createComment(postId: number, payload: CreateCommentRequest) {
    const data = await api.post<CommentResponse>(
      `${BASE}/posts/${postId}/comments`,
      payload
    );
    return data;
  }

  static async updateComment(commentId: number, payload: UpdateCommentRequest) {
    const data = await api.put<CommentResponse>(
      `${BASE}/posts/comments/${commentId}`,
      payload
    );
    return data;
  }

  static async deleteComment(commentId: number) {
    await api.delete(`${BASE}/posts/comments/${commentId}`);
  }

  static async acceptAnswer(postId: number, commentId: number) {
    await api.post(`${BASE}/posts/${postId}/comments/${commentId}/accept`);
  }

  // --- Votes ---
  static async vote(targetType: TargetType, targetId: number, payload: VoteRequest) {
    const data = await api.post<VoteResponse>(
      `${BASE}/votes/${targetType}/${targetId}`,
      payload
    );
    return data;
  }

  // --- Bookmarks ---
  static async toggleBookmark(postId: number) {
    const data = await api.post<BookmarkResponse>(
      `${BASE}/bookmarks/${postId}/toggle`
    );
    return data;
  }

  // --- Follows ---
  static async toggleFollowUser(targetUserId: string) {
    const data = await api.post<FollowResponse>(
      `${BASE}/follows/users/${targetUserId}/toggle`
    );
    return data;
  }

  static async toggleFollowTag(tagSlug: string) {
    const data = await api.post<FollowResponse>(
      `${BASE}/follows/tags/${tagSlug}/toggle`
    );
    return data;
  }

  // --- Categories ---
  static async getCategories() {
    const data = await api.get<CategoryResponse[]>(`${BASE}/categories`);
    return data;
  }

  static async getCategoryBySlug(slug: string) {
    const data = await api.get<CategoryResponse>(`${BASE}/categories/${slug}`);
    return data;
  }

  // --- Tags ---
  static async getTrendingTags(limit = 10) {
    const data = await api.get<TagResponse[]>(`${BASE}/tags/trending?limit=${limit}`);
    return data;
  }

  static async searchTags(q: string) {
    const data = await api.get<TagResponse[]>(`${BASE}/tags/search?q=${encodeURIComponent(q)}`);
    return data;
  }

  static async createTag(payload: CreateTagRequest) {
    const data = await api.post<TagResponse>(`${BASE}/tags`, payload);
    return data;
  }

  // --- Search ---
  static async searchPosts(q: string, page = 0, size = 20) {
    const data = await api.get<PagedResponse<PostSummaryResponse>>(
      `${BASE}/search?q=${encodeURIComponent(q)}&page=${page}&size=${size}`
    );
    return data;
  }

  // --- Notifications ---
  static async getNotifications(page = 0, size = 20) {
    const data = await api.get<PagedResponse<NotificationResponse>>(
      `${BASE}/notifications?page=${page}&size=${size}`
    );
    return data;
  }

  static async getUnreadCount() {
    const data = await api.get<number>(`${BASE}/notifications/unread-count`);
    return data;
  }

  static async markAllRead() {
    await api.post(`${BASE}/notifications/mark-all-read`);
  }

  // --- Reputation ---
  static async getReputation(userId: string) {
    const data = await api.get<ReputationResponse>(`${BASE}/users/${userId}/reputation`);
    return data;
  }

  // --- Moderation ---
  static async reportContent(payload: ReportRequest) {
    await api.post(`${BASE}/moderation/reports`, payload);
  }
}
