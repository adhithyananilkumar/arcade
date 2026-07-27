import { api } from '@/infrastructure/http/api';
import type {
  CommentResponse,
  CreateCommentRequest,
  CreatePostRequest,
  LikeRequest,
  PagedPostResponse,
  PostResponse,
} from '../types/forum.types';

const BASE = '/api/v1/forum';

export class ForumService {
  // --- Posts ---
  static async getFeed(sort = 'recent', page = 0, size = 20): Promise<PagedPostResponse> {
    return await api.get<PagedPostResponse>(`${BASE}/posts?sort=${sort}&page=${page}&size=${size}`);
  }

  static async createPost(request: CreatePostRequest): Promise<PostResponse> {
    return await api.post<PostResponse>(`${BASE}/posts`, request);
  }

  static async deletePost(postId: string): Promise<void> {
    return await api.delete(`${BASE}/posts/${postId}`);
  }

  // --- Comments ---
  static async getComments(postId: string): Promise<CommentResponse[]> {
    return await api.get<CommentResponse[]>(`${BASE}/posts/${postId}/comments`);
  }

  static async addComment(postId: string, request: CreateCommentRequest): Promise<CommentResponse> {
    return await api.post<CommentResponse>(`${BASE}/posts/${postId}/comments`, request);
  }

  // --- Likes/Reactions ---
  static async toggleLike(postId: string, request?: LikeRequest): Promise<PostResponse> {
    return await api.post<PostResponse>(`${BASE}/posts/${postId}/like`, request || { likeType: 'UPVOTE' });
  }
}
