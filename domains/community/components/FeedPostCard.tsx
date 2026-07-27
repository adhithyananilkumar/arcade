'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useToggleLike, useDeletePost } from '../api/forum.queries';
import { CommentSection } from './CommentSection';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  MessageSquare,
  Share2,
  Trash2,
  ThumbsUp,
  Heart,
  PartyPopper,
  Lightbulb,
  ArrowUpCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { timeAgo } from '../utils/display';
import type { PostResponse, ReactionType } from '../types/forum.types';

interface FeedPostCardProps {
  post: PostResponse;
}

const REACTIONS: { type: ReactionType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'UPVOTE', label: 'Upvote', icon: <ArrowUpCircle className="w-4 h-4" />, color: 'text-orange-500' },
  { type: 'LIKE', label: 'Like', icon: <ThumbsUp className="w-4 h-4" />, color: 'text-blue-500' },
  { type: 'HEART', label: 'Heart', icon: <Heart className="w-4 h-4 fill-red-500 text-red-500" />, color: 'text-red-500' },
  { type: 'CELEBRATE', label: 'Celebrate', icon: <PartyPopper className="w-4 h-4" />, color: 'text-yellow-500' },
  { type: 'INSIGHTFUL', label: 'Insightful', icon: <Lightbulb className="w-4 h-4" />, color: 'text-amber-500' },
];

export function FeedPostCard({ post }: FeedPostCardProps) {
  const { user, status } = useAuthStore();
  const router = useRouter();
  const { mutate: toggleLike, isPending: isLiking } = useToggleLike(post.id);
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();

  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls : (post.mediaUrl ? [post.mediaUrl] : []);

  React.useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : 0));
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % images.length : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, images.length]);

  const isAuthenticated = status === 'authenticated' && !!user;
  const isOwner = isAuthenticated && user.id === post.authorId;

  const currentReaction = REACTIONS.find((r) => r.type === post.currentUserLikeType) || REACTIONS[0];

  const handleLikeClick = (type: ReactionType = 'UPVOTE') => {
    if (!isAuthenticated) {
      toast.error('Please sign in to react to posts!');
      router.push('/sign?returnTo=/forum');
      return;
    }
    toggleLike({ likeType: type });
    setShowReactions(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost(post.id);
    }
  };

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/forum`;
    }
    return 'https://arcade.college/forum';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
    setShowShareMenu(false);
  };

  const shareToSocial = (platform: 'linkedin' | 'reddit' | 'twitter' | 'whatsapp') => {
    const url = encodeURIComponent(getShareUrl());
    const title = encodeURIComponent(post.title);
    let shareUrl = '';

    if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    } else if (platform === 'reddit') {
      shareUrl = `https://reddit.com/submit?url=${url}&title=${title}`;
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
    } else if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-all duration-300 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
            {post.authorAvatarUrl ? (
              <img src={post.authorAvatarUrl} alt={post.authorUsername} className="h-full w-full rounded-full object-cover" />
            ) : (
              (post.authorUsername?.[0] || 'U').toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-800 dark:text-neutral-100">
                {post.authorUsername}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                Creator
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-neutral-500">
              {timeAgo(post.createdAt)}
            </span>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete post"
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          {post.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line font-normal">
          {post.content}
        </p>
      </div>

      {/* Media Image Collage Grid */}
      {images.length === 1 && (
        <div
          onClick={() => setLightboxIndex(0)}
          className="mb-4 rounded-xl overflow-hidden border border-slate-200/60 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 max-h-[450px] flex items-center justify-center cursor-pointer group"
        >
          <img
            src={images[0]}
            alt="Post attachment"
            className="w-full h-auto object-cover max-h-[450px] group-hover:scale-[1.01] transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {images.length === 2 && (
        <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden border border-slate-200/60 dark:border-neutral-800 bg-slate-900 max-h-[400px]">
          {images.map((img, idx) => (
            <div key={idx} onClick={() => setLightboxIndex(idx)} className="relative h-64 sm:h-80 cursor-pointer overflow-hidden group">
              <img src={img} alt={`Collage ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      )}

      {images.length === 3 && (
        <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden border border-slate-200/60 dark:border-neutral-800 bg-slate-900 h-64 sm:h-80">
          <div onClick={() => setLightboxIndex(0)} className="relative h-full cursor-pointer overflow-hidden group">
            <img src={images[0]} alt="Collage 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="grid grid-rows-2 gap-1.5 h-full">
            {[images[1], images[2]].map((img, idx) => (
              <div key={idx + 1} onClick={() => setLightboxIndex(idx + 1)} className="relative h-full cursor-pointer overflow-hidden group">
                <img src={img} alt={`Collage ${idx + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length >= 4 && (
        <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden border border-slate-200/60 dark:border-neutral-800 bg-slate-900 h-64 sm:h-80">
          {images.slice(0, 4).map((img, idx) => (
            <div key={idx} onClick={() => setLightboxIndex(idx)} className="relative h-full cursor-pointer overflow-hidden group">
              <img src={img} alt={`Collage ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {idx === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-extrabold text-3xl tracking-tight transition-opacity group-hover:bg-black/70">
                  +{images.length - 3}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats Counter */}
      <div className="flex items-center justify-between py-2 px-1 text-xs text-slate-500 dark:text-neutral-400 border-b border-slate-100 dark:border-neutral-800/80 mb-3">
        <div className="flex items-center gap-1.5">
          {post.likesCount > 0 ? (
            <>
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px]">
                👍
              </span>
              <span className="font-medium text-slate-700 dark:text-neutral-300">
                {post.likesCount} {post.likesCount === 1 ? 'reaction' : 'reactions'}
              </span>
            </>
          ) : (
            <span>Be the first to react</span>
          )}
        </div>
        <div>
          <span>{post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-1 relative">
        {/* Reaction Button + Picker */}
        <div className="relative">
          <button
            onClick={() => handleLikeClick(post.isLikedByCurrentUser ? (post.currentUserLikeType as ReactionType) : 'UPVOTE')}
            onMouseEnter={() => setShowReactions(true)}
            disabled={isLiking}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              post.isLikedByCurrentUser
                ? `${currentReaction.color} bg-blue-50 dark:bg-blue-900/20`
                : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
            }`}
          >
            {post.isLikedByCurrentUser ? currentReaction.icon : <ArrowUpCircle className="w-4 h-4 text-slate-500" />}
            <span>{post.isLikedByCurrentUser ? currentReaction.label : 'Upvote'}</span>
          </button>

          {/* Reaction Picker Popover */}
          {showReactions && (
            <div
              onMouseLeave={() => setShowReactions(false)}
              className="absolute left-0 bottom-full mb-2 p-1.5 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-xl flex items-center gap-1.5 z-20 animate-in fade-in zoom-in-95 duration-150"
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={() => handleLikeClick(r.type)}
                  title={r.label}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-700 hover:scale-125 transition-all duration-150 flex items-center justify-center text-sm"
                >
                  {r.icon}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment Toggle Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <span>Comment</span>
        </button>

        {/* Share Button + Popover */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Share2 className="w-4 h-4 text-slate-500" />
            <span>Share</span>
          </button>

          {showShareMenu && (
            <div className="absolute right-0 bottom-full mb-2 w-48 p-2 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-xl z-20 animate-in fade-in zoom-in-95 duration-150 space-y-1">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <div className="h-px bg-slate-100 dark:bg-neutral-700 my-1" />
              <button
                onClick={() => shareToSocial('linkedin')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-neutral-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Share to LinkedIn
              </button>
              <button
                onClick={() => shareToSocial('reddit')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-neutral-200 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-orange-600 dark:text-orange-400 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Share to Reddit
              </button>
              <button
                onClick={() => shareToSocial('twitter')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Share to X (Twitter)
              </button>
              <button
                onClick={() => shareToSocial('whatsapp')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-neutral-200 hover:bg-green-50 dark:hover:bg-green-950/30 text-green-600 dark:text-green-400 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Share to WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline Comments Section */}
      {showComments && <CommentSection postId={post.id} />}

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Lightbox Top Bar */}
          <div
            className="flex items-center justify-between p-4 px-6 text-white/90 bg-gradient-to-b from-black/60 to-transparent z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm">{post.authorUsername}&apos;s photos</span>
              <span className="text-xs bg-white/15 px-3 py-1 rounded-full text-white font-medium">
                {lightboxIndex + 1} of {images.length}
              </span>
            </div>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Main Image */}
          <div
            className="flex-1 relative flex items-center justify-center p-4 min-h-0 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : 0));
                }}
                className="absolute left-4 sm:left-8 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 transition-all hover:scale-105 shadow-xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={images[lightboxIndex]}
              alt={`Fullscreen ${lightboxIndex + 1}`}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-all duration-200 select-none"
            />

            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null ? (prev + 1) % images.length : 0));
                }}
                className="absolute right-4 sm:right-8 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/15 transition-all hover:scale-105 shadow-xl"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Strip */}
          {images.length > 1 && (
            <div
              className="p-4 px-6 bg-black/80 border-t border-white/10 flex items-center justify-center gap-2.5 overflow-x-auto max-w-full z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative h-16 w-24 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    lightboxIndex === idx
                      ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/30 opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
