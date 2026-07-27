/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Community
 *
 * Purpose:
 * Exposes the public API for the Community domain.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export { LoadingSkeleton } from './components/LoadingSkeleton';
export { EmptyState } from './components/EmptyState';
export { useForumFeed, usePostComments, useCreatePost, useDeletePost, useAddComment, useToggleLike } from './api/forum.queries';
export { UserAvatar } from './components/UserAvatar';
export { ShareButton } from './components/ShareButton';
export { PostCreateCard } from './components/PostCreateCard';
export { FeedPostCard } from './components/FeedPostCard';
export { CommentSection } from './components/CommentSection';
export { useWebSocket } from './hooks/useWebSocket';
export { timeAgo } from './utils/display';