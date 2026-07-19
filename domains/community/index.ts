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

export { ForumSidebar } from './components/ForumSidebar';
export { TrendingSidebar } from './components/TrendingSidebar';
export { NotificationPanel } from './components/NotificationPanel';
export { NavUserMenu } from './components/NavUserMenu';
export { PostCard } from './components/PostCard';
export { LoadingSkeleton } from './components/LoadingSkeleton';
export { EmptyState } from './components/EmptyState';
export { useToggleFollowTag, useCategoryBySlug, useSearchPosts, useToggleBookmark, usePostsByCategory, useForumFeed, usePost, usePostsByTag } from './api/forum.queries';
export { UserAvatar } from './components/UserAvatar';
export { PostCreatorDialog } from './components/PostCreatorDialog';
export { CommentThread } from './components/CommentThread';
export { VoteButtons } from './components/VoteButtons';
export { TagBadge } from './components/TagBadge';
export { PostTypeBadge } from './components/PostTypeBadge';
export { ShareButton } from './components/ShareButton';
export { useWebSocket } from './hooks/useWebSocket';
export { timeAgo } from './utils/display';