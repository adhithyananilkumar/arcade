// PostShareDialog — fully functional share component
// Exports: PostShareDialog (standalone), ShareButton (drop-in wrapper)
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, X, Search, Send, Loader2, Link2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore, User } from '@/store/auth.store';
import { UserService } from '@/services/user.service';
import { apiClient } from '@/lib/apiClient';
import { UserAvatar } from './UserAvatar';
import { displayName } from '../utils/display';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PostShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Absolute or relative URL of the post to share */
  url?: string;
  /** Title shown in the dialog header and passed to Web Share API */
  title?: string;
  /** Post ID — required for "Send to User" feature */
  postId?: number;
  /** Comment ID — used when sharing a specific comment anchor */
  commentId?: number;
}

// Props kept identical to the original ShareButton so no call-sites break
interface ShareButtonProps {
  url?: string;
  size?: number;
  title?: string;
  body?: string;
  postId?: number;
  commentId?: number;
  /** 'modal' = large centered modal (default) | 'popover' = small dropdown */
  variant?: 'modal' | 'popover';
}

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.379 1.966 13.903.935 11.274.935c-5.437 0-9.863 4.371-9.867 9.8.001 2.128.575 4.208 1.661 6.013L1.996 21.73l5.066-1.32c1.7.926 3.228 1.396 4.885 1.396h.001zm11.516-7.793c-.32-.16-1.89-.93-2.185-1.04-.294-.11-.508-.16-.723.16-.214.32-.832 1.04-1.02 1.255-.188.215-.375.24-.694.08-.319-.16-1.348-.497-2.568-1.588-.95-.848-1.59-1.895-1.777-2.214-.188-.32-.02-.492.14-.65.143-.143.32-.375.48-.563.16-.188.214-.32.32-.533.107-.215.054-.403-.027-.563-.08-.16-.723-1.74-.99-2.385-.26-.625-.527-.54-.723-.55-.187-.01-.402-.01-.617-.01-.215 0-.563.08-.857.4-.295.32-1.127 1.103-1.127 2.694 0 1.59 1.159 3.129 1.32 3.344.162.215 2.28 3.482 5.523 4.883.772.33 1.376.528 1.848.678.775.246 1.48.211 2.037.128.62-.093 1.89-.773 2.158-1.48.267-.707.267-1.313.187-1.439-.08-.126-.295-.207-.615-.368z" />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const XTwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.11 18.1.128 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

// ─── Social App Config ────────────────────────────────────────────────────────

interface SocialApp {
  name: string;
  color: string;
  icon: React.ReactNode;
  getUrl: () => string;
  onClick?: (shareUrl: string) => void;
}

function buildSocialApps(shareUrl: string): SocialApp[] {
  const enc = encodeURIComponent(shareUrl);
  const encTitle = encodeURIComponent('Check out this post on Arcade:');

  return [
    {
      name: 'WhatsApp',
      color: '#25D366',
      icon: <WhatsAppIcon />,
      getUrl: () => `https://api.whatsapp.com/send?text=${encTitle}%20${enc}`,
    },
    {
      name: 'Telegram',
      color: '#26A5E4',
      icon: <TelegramIcon />,
      getUrl: () => `https://t.me/share/url?url=${enc}&text=${encTitle}`,
    },
    {
      name: 'X / Twitter',
      color: '#0f1419',
      icon: <XTwitterIcon />,
      getUrl: () => `https://twitter.com/intent/tweet?url=${enc}&text=${encTitle}`,
    },
    {
      name: 'Facebook',
      color: '#1877F2',
      icon: <FacebookIcon />,
      getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
    },
    {
      name: 'LinkedIn',
      color: '#0A66C2',
      icon: <LinkedInIcon />,
      getUrl: () => `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`,
    },
    {
      name: 'Email',
      color: '#EA4335',
      icon: <EmailIcon />,
      getUrl: () => `mailto:?subject=${encTitle}&body=${enc}`,
    },
    {
      name: 'Reddit',
      color: '#FF4500',
      icon: <RedditIcon />,
      getUrl: () => `https://reddit.com/submit?url=${enc}&title=${encTitle}`,
    },
    {
      name: 'Discord',
      color: '#5865F2',
      icon: <DiscordIcon />,
      getUrl: () => '#',
      onClick: (url: string) => {
        navigator.clipboard.writeText(url).catch(() => {});
        toast.success('Link copied! Paste it into Discord.');
      },
    },
  ];
}

// ─── Send-to-User Section ─────────────────────────────────────────────────────

interface SendToUserProps {
  postId?: number;
  commentId?: number;
  shareUrl: string;
}

function SendToUserSection({ postId, commentId }: SendToUserProps) {
  const { user: currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sharingUserId, setSharingUserId] = useState<string | null>(null);
  const [sharedUserIds, setSharedUserIds] = useState<Set<string>>(new Set());

  // Debounced user search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const users = await UserService.searchUsers(searchQuery);
        setSearchResults(users.filter(u => u.id !== currentUser?.id));
      } catch { /* ignore */ } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, currentUser?.id]);

  const handleSend = async (user: User) => {
    if (!postId) { toast.error('Post ID is missing.'); return; }
    setSharingUserId(user.id);
    try {
      const endpoint = commentId
        ? `/forum/notifications/share?recipientId=${user.id}&postId=${postId}&commentId=${commentId}`
        : `/forum/notifications/share?recipientId=${user.id}&postId=${postId}`;
      await apiClient.post(endpoint);
      setSharedUserIds(prev => new Set([...prev, user.id]));
      toast.success(`Shared with ${user.fullName || displayName(user.email)}!`);
    } catch {
      toast.error('Failed to share.');
    } finally {
      setSharingUserId(null);
    }
  };

  if (!currentUser) {
    return (
      <div style={{
        padding: '12px 14px',
        fontSize: 13,
        color: 'var(--text-muted)',
        border: '1px dashed var(--border)',
        borderRadius: 10,
        textAlign: 'center',
      }}>
        Sign in to share directly with other users
      </div>
    );
  }

  return (
    <div>
      {/* Search input */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 11, flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            height: 38,
            padding: '0 34px 0 32px',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 13,
            color: 'var(--text-primary)',
            backgroundColor: 'var(--surface)',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--arcade-blue)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
        {isSearching && (
          <Loader2 size={14} className="animate-spin" style={{ position: 'absolute', right: 11, color: 'var(--text-muted)' }} />
        )}
      </div>

      {/* Results */}
      {searchQuery.trim().length > 0 && (
        <div style={{
          marginTop: 8,
          border: '1px solid var(--border)',
          borderRadius: 10,
          maxHeight: 176,
          overflowY: 'auto',
          backgroundColor: 'var(--surface)',
        }}>
          {searchResults.length === 0 ? (
            <div style={{ padding: '12px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
              {isSearching ? 'Searching...' : 'No users found'}
            </div>
          ) : (
            searchResults.map(user => {
              const isShared = sharedUserIds.has(user.id);
              const isSending = sharingUserId === user.id;
              return (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <UserAvatar username={user.email} avatarUrl={user.avatarUrl} size="sm" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {user.fullName || displayName(user.email)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSend(user)}
                    disabled={isShared || isSending}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      height: 28,
                      padding: '0 12px',
                      borderRadius: 8,
                      backgroundColor: isShared ? '#ecfdf5' : 'var(--arcade-blue)',
                      color: isShared ? '#16a34a' : '#fff',
                      border: isShared ? '1px solid #86efac' : 'none',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: isShared || isSending ? 'default' : 'pointer',
                    }}
                  >
                    {isSending
                      ? <Loader2 size={11} className="animate-spin" />
                      : isShared
                        ? <><Check size={11} /> Sent</>
                        : <><Send size={11} /> Send</>
                    }
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
      {searchQuery.trim().length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 0', textAlign: 'center' }}>
          Type a name or email to find users
        </p>
      )}
    </div>
  );
}

// ─── PostShareDialog ──────────────────────────────────────────────────────────

export function PostShareDialog({
  isOpen,
  onClose,
  url,
  title = 'Share this post',
  postId,
  commentId,
}: PostShareDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Build the share URL (always absolute)
  const shareUrl = (() => {
    if (!url) return typeof window !== 'undefined' ? window.location.href : '';
    if (url.startsWith('http')) return url;
    return (typeof window !== 'undefined' ? window.location.origin : '') + url;
  })();

  const socialApps = buildSocialApps(shareUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success('✓ Link copied successfully');
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedLink(true);
      toast.success('✓ Link copied successfully');
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              zIndex: 9998,
            }}
          />

          {/* ── Modal ── */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, x: '-50%', y: '-48%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.94, x: '-50%', y: '-48%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              width: 500,
              maxWidth: 'calc(100vw - 32px)',
              backgroundColor: '#fff',
              borderRadius: 20,
              boxShadow: '0 24px 56px -10px rgba(0,0,0,0.18), 0 4px 16px -4px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.06)',
              zIndex: 9999,
              overflow: 'hidden',
            }}
          >
            {/* ── Header ── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px 16px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: 'var(--arcade-blue-light, #EEF2FF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Share2 size={17} color="var(--arcade-blue)" />
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 750, color: 'var(--text-primary)', margin: 0 }}>
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: 'var(--surface)',
                  border: 'none',
                  cursor: 'pointer',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  transition: 'background-color 0.14s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div style={{ padding: '20px 24px 24px', overflowY: 'auto', maxHeight: '70vh', display: 'flex', flexDirection: 'column', gap: 22 }}>

              {/* ── Copy Link ── */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                  Copy link
                </p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '0 12px',
                    height: 40,
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    backgroundColor: 'var(--surface)',
                    minWidth: 0,
                  }}>
                    <Link2 size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    <span style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {shareUrl}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '0 16px',
                      height: 40,
                      borderRadius: 10,
                      border: 'none',
                      backgroundColor: copiedLink ? '#ecfdf5' : 'var(--arcade-blue)',
                      color: copiedLink ? '#16a34a' : '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s, color 0.2s',
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* ── Social Apps ── */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
                  Share via
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 10,
                }}>
                  {socialApps.map(app => {
                    const href = app.getUrl();
                    const isDiscord = app.name === 'Discord';
                    return (
                      <a
                        key={app.name}
                        href={isDiscord ? undefined : href}
                        onClick={
                          isDiscord
                            ? (e) => { e.preventDefault(); app.onClick?.(shareUrl); }
                            : undefined
                        }
                        target={isDiscord ? undefined : '_blank'}
                        rel="noreferrer noopener"
                        role={isDiscord ? 'button' : undefined}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 7,
                          padding: '12px 6px 10px',
                          borderRadius: 14,
                          textDecoration: 'none',
                          color: 'var(--text-secondary)',
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          transition: 'transform 0.13s, background-color 0.13s, box-shadow 0.13s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                          e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(0,0,0,0.10)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.backgroundColor = 'var(--surface)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 13,
                          background: app.color,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 3px 8px -2px ${app.color}55`,
                        }}>
                          {app.icon}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                          {app.name}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── Popover variant (used for comments) ─────────────────────────────────────

interface PopoverProps {
  shareUrl: string;
  postId?: number;
  commentId?: number;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}

function SharePopover({ shareUrl, postId, commentId, anchorRef, onClose }: PopoverProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [tab, setTab] = useState<'link' | 'apps'>('link');
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: -9999, left: -9999 });

  const socialApps = buildSocialApps(shareUrl);

  // Position relative to anchor button
  useEffect(() => {
    const update = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const popW = 300;
      const popH = popoverRef.current?.offsetHeight || 280;
      let left = rect.left + window.scrollX;
      let top = rect.bottom + window.scrollY + 8;
      if (left + popW > window.innerWidth - 12) left = window.innerWidth - popW - 12 + window.scrollX;
      if (left < 8 + window.scrollX) left = 8 + window.scrollX;
      if (rect.bottom + popH + 16 > window.innerHeight) top = rect.top + window.scrollY - popH - 8;
      setPosition({ top, left });
    };
    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [anchorRef]);

  // Outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorRef]);

  // Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); } catch { /* ignore */ }
    setCopiedLink(true);
    toast.success('✓ Link copied successfully');
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const tabs = [
    { id: 'link' as const, label: 'Copy Link' },
    { id: 'apps' as const, label: 'Apps' },
  ];

  return createPortal(
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: 300,
        backgroundColor: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 32px -4px rgba(0,0,0,0.18)',
        border: '1px solid rgba(0,0,0,0.07)',
        zIndex: 99999,
        overflow: 'hidden',
      }}
    >
      {/* Arrow */}
      <div style={{ position: 'absolute', top: -7, left: 22, width: 14, height: 14, backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderBottom: 'none', borderRight: 'none', transform: 'rotate(45deg)', zIndex: 1 }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px 9px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Share Comment</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8, display: 'flex', color: 'var(--text-muted)' }}>
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 6px' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '8px 4px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? 'var(--arcade-blue)' : 'var(--text-muted)',
              borderBottom: tab === t.id ? '2px solid var(--arcade-blue)' : '2px solid transparent',
              transition: 'all 0.14s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div style={{ padding: '12px 14px 14px' }}>
        {tab === 'link' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', backgroundColor: 'var(--surface)', borderRadius: 9, border: '1px solid var(--border)', marginBottom: 9 }}>
              <Link2 size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{shareUrl}</span>
            </div>
            <button
              onClick={handleCopyLink}
              style={{
                width: '100%', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                borderRadius: 9, border: 'none',
                backgroundColor: copiedLink ? '#ecfdf5' : 'var(--arcade-blue)',
                color: copiedLink ? '#16a34a' : '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
              }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        )}

        {tab === 'apps' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {socialApps.map(app => {
              const isDiscord = app.name === 'Discord';
              const href = app.getUrl();
              return (
                <a
                  key={app.name}
                  href={isDiscord ? undefined : href}
                  onClick={isDiscord ? (e) => { e.preventDefault(); app.onClick?.(shareUrl); } : undefined}
                  target={isDiscord ? undefined : '_blank'}
                  rel="noreferrer"
                  role={isDiscord ? 'button' : undefined}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '8px 4px', borderRadius: 10, textDecoration: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'transform 0.12s, background-color 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: app.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px -1px rgba(0,0,0,0.12)' }}>{app.icon}</div>
                  <span style={{ fontSize: 9, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{app.name}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── ShareButton (drop-in replacement, same API as before) ────────────────────

export function ShareButton({
  url,
  size = 14,
  title = 'Share',
  postId,
  commentId,
  variant = 'modal',
}: ShareButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  // Build absolute share URL
  const shareUrl = (() => {
    if (!url) return typeof window !== 'undefined' ? window.location.href : '';
    if (url.startsWith('http')) return url;
    return (typeof window !== 'undefined' ? window.location.origin : '') + url;
  })();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Try Web Share API first (supported on mobile / some desktop browsers)
    if (variant === 'modal' && typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return; // native sheet handled it — no dialog needed
      } catch (err: unknown) {
        // User cancelled (AbortError) or API not fully supported → fall through to modal
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    setIsOpen(prev => !prev);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '0 12px',
          height: 32,
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--surface)',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-muted)',
          transition: 'background-color 0.14s, color 0.14s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'var(--surface)';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        <Share2 size={size} />
        Share
      </button>

      {/* Popover variant (for comments) */}
      {variant === 'popover' && isOpen && mounted && (
        <SharePopover
          shareUrl={shareUrl}
          postId={postId}
          commentId={commentId}
          anchorRef={buttonRef}
          onClose={() => setIsOpen(false)}
        />
      )}

      {/* Modal variant (for posts) */}
      {variant === 'modal' && (
        <PostShareDialog
          isOpen={isOpen && mounted}
          onClose={() => setIsOpen(false)}
          url={shareUrl}
          title="Share this post"
          postId={postId}
          commentId={commentId}
        />
      )}
    </>
  );
}
