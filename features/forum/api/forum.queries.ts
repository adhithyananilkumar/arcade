import { useAuthStore } from '@/store/auth.store';
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { ForumService } from './forum.service';
import type {
  CreateCommentRequest,
  CreatePostRequest,
  PagedResponse,
  PostSummaryResponse,
  ReportRequest,
  TargetType,
  UpdateCommentRequest,
  UpdatePostRequest,
  VoteRequest,
} from '../types/forum.types';

// Keys
export const forumKeys = {
  feed: (feedType: string, page: number, authId?: string) => ['forum', 'feed', feedType, page, authId] as const,
  post: (slug: string, authId?: string) => ['forum', 'post', slug, authId] as const,
  postsByCategory: (slug: string, page: number) => ['forum', 'category', slug, page] as const,
  postsByTag: (tagSlug: string, page: number) => ['forum', 'tag', tagSlug, page] as const,
  postsByAuthor: (authorId: string, page: number) => ['forum', 'author', authorId, page] as const,
  comments: (postId: number, page: number) => ['forum', 'comments', postId, page] as const,
  categories: () => ['forum', 'categories'] as const,
  category: (slug: string) => ['forum', 'category-detail', slug] as const,
  trendingTags: (limit: number) => ['forum', 'trending-tags', limit] as const,
  search: (q: string, page: number) => ['forum', 'search', q, page] as const,
  notifications: (page: number) => ['forum', 'notifications', page] as const,
  unreadCount: () => ['forum', 'unread-count'] as const,
  reputation: (userId: string) => ['forum', 'reputation', userId] as const,
};

// --- Queries ---
export function useForumFeed(feedType = 'latest', page = 0, size = 20) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: forumKeys.feed(feedType, page, user?.id),
    queryFn: () => ForumService.getFeed(feedType, page, size),
    placeholderData: (prev) => prev,
  });
}

export function usePost(slug: string) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: forumKeys.post(slug, user?.id),
    queryFn: () => ForumService.getPostBySlug(slug),
    enabled: !!slug,
  });
}

export function usePostsByCategory(slug: string, page = 0, size = 20) {
  return useQuery({
    queryKey: forumKeys.postsByCategory(slug, page),
    queryFn: () => ForumService.getPostsByCategory(slug, page, size),
    enabled: !!slug,
    placeholderData: (prev) => prev,
  });
}

export function usePostsByTag(tagSlug: string, page = 0, size = 20) {
  return useQuery({
    queryKey: forumKeys.postsByTag(tagSlug, page),
    queryFn: () => ForumService.getPostsByTag(tagSlug, page, size),
    enabled: !!tagSlug,
    placeholderData: (prev) => prev,
  });
}

export function useComments(postId: number, page = 0, size = 20) {
  return useQuery({
    queryKey: forumKeys.comments(postId, page),
    queryFn: () => ForumService.getComments(postId, page, size),
    enabled: !!postId,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: forumKeys.categories(),
    queryFn: ForumService.getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: forumKeys.category(slug),
    queryFn: () => ForumService.getCategoryBySlug(slug),
    enabled: !!slug,
  });
}

export function useTrendingTags(limit = 10) {
  return useQuery({
    queryKey: forumKeys.trendingTags(limit),
    queryFn: () => ForumService.getTrendingTags(limit),
    staleTime: 2 * 60 * 1000,
  });
}

export function useSearchPosts(q: string, page = 0, size = 20) {
  return useQuery({
    queryKey: forumKeys.search(q, page),
    queryFn: () => ForumService.searchPosts(q, page, size),
    enabled: q.length > 1,
    placeholderData: (prev) => prev,
  });
}

export function useNotifications(page = 0, size = 20) {
  return useQuery({
    queryKey: forumKeys.notifications(page),
    queryFn: () => ForumService.getNotifications(page, size),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: forumKeys.unreadCount(),
    queryFn: ForumService.getUnreadCount,
    refetchInterval: 60 * 1000,
  });
}

export function useReputation(userId: string) {
  return useQuery({
    queryKey: forumKeys.reputation(userId),
    queryFn: () => ForumService.getReputation(userId),
    enabled: !!userId,
  });
}

// --- Mutations ---
export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostRequest) => ForumService.createPost(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forum', 'feed'] });
      toast.success('Post published!');
    },
    onError: () => toast.error('Failed to publish post'),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, payload }: { postId: number; payload: UpdatePostRequest }) =>
      ForumService.updatePost(postId, payload),
    onSuccess: (_, { postId }) => {
      qc.invalidateQueries({ queryKey: ['forum', 'feed'] });
      toast.success('Post updated!');
    },
    onError: () => toast.error('Failed to update post'),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => ForumService.deletePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forum', 'feed'] });
      toast.success('Post deleted');
    },
    onError: () => toast.error('Failed to delete post'),
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, payload }: { postId: number; payload: CreateCommentRequest }) =>
      ForumService.createComment(postId, payload),
    onSuccess: (_, { postId }) => {
      qc.invalidateQueries({ queryKey: ['forum', 'comments', postId] });
    },
    onError: () => toast.error('Failed to post comment'),
  });
}

export function useUpdateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, payload }: { commentId: number; payload: UpdateCommentRequest }) =>
      ForumService.updateComment(commentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forum', 'comments'] });
    },
    onError: () => toast.error('Failed to update comment'),
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => ForumService.deleteComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forum', 'comments'] });
    },
    onError: () => toast.error('Failed to delete comment'),
  });
}

export function useAcceptAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: number; commentId: number }) =>
      ForumService.acceptAnswer(postId, commentId),
    onSuccess: (_, { postId }) => {
      qc.invalidateQueries({ queryKey: ['forum', 'comments'] });
      qc.invalidateQueries({ queryKey: ['forum', 'post'] });
      toast.success('Answer accepted!');
    },
    onError: () => toast.error('Failed to accept answer'),
  });
}

export function useVote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      targetType,
      targetId,
      payload,
    }: {
      targetType: TargetType;
      targetId: number;
      payload: VoteRequest;
    }) => ForumService.vote(targetType, targetId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forum'] });
    },
  });
}

export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => ForumService.toggleBookmark(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forum', 'feed'] });
    },
  });
}

export function useToggleFollowUser() {
  return useMutation({
    mutationFn: (targetUserId: string) => ForumService.toggleFollowUser(targetUserId),
    onSuccess: (data) => {
      toast.success(data.following ? 'Following user' : 'Unfollowed');
    },
  });
}

export function useToggleFollowTag() {
  return useMutation({
    mutationFn: (tagSlug: string) => ForumService.toggleFollowTag(tagSlug),
    onSuccess: (data) => {
      toast.success(data.following ? 'Following tag' : 'Unfollowed');
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ForumService.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: forumKeys.unreadCount() });
      qc.invalidateQueries({ queryKey: ['forum', 'notifications'] });
    },
  });
}

export function useReportContent() {
  return useMutation({
    mutationFn: (payload: ReportRequest) => ForumService.reportContent(payload),
    onSuccess: () => toast.success('Report submitted. Thank you.'),
    onError: () => toast.error('Failed to submit report'),
  });
}
