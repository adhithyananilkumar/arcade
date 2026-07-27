import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ForumService } from './forum.service';
import type {
  CreateCommentRequest,
  CreatePostRequest,
  LikeRequest,
} from '../types/forum.types';

export const forumKeys = {
  feed: (sort: string, page: number, authId?: string) => ['forum', 'feed', sort, page, authId] as const,
  comments: (postId: string) => ['forum', 'comments', postId] as const,
};

export function useForumFeed(sort = 'recent', page = 0, size = 20) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: forumKeys.feed(sort, page, user?.id),
    queryFn: () => ForumService.getFeed(sort, page, size),
    placeholderData: (prev) => prev,
  });
}

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: forumKeys.comments(postId),
    queryFn: () => ForumService.getComments(postId),
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreatePostRequest) => ForumService.createPost(request),
    onSuccess: () => {
      toast.success('Post created successfully!');
      queryClient.invalidateQueries({ queryKey: ['forum', 'feed'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create post');
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => ForumService.deletePost(postId),
    onSuccess: () => {
      toast.success('Post deleted');
      queryClient.invalidateQueries({ queryKey: ['forum', 'feed'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete post');
    },
  });
}

export function useAddComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateCommentRequest) => ForumService.addComment(postId, request),
    onSuccess: () => {
      toast.success('Comment added');
      queryClient.invalidateQueries({ queryKey: forumKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: ['forum', 'feed'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to add comment');
    },
  });
}

export function useToggleLike(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request?: LikeRequest) => ForumService.toggleLike(postId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'feed'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Please sign in to react');
    },
  });
}
