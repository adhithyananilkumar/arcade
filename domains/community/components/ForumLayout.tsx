'use client';

import { ForumSidebar } from './ForumSidebar';
import { TrendingSidebar } from './TrendingSidebar';
import { NotificationPanel } from './NotificationPanel';
import { NavUserMenu } from './NavUserMenu';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForumLayout } from './ForumLayoutContext';

interface Props {
  children: React.ReactNode;
}

export function ForumLayout({ children }: Props) {
  const { status } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState('');
  const [mounted, setMounted] = useState(false);
  const { hideTrending } = useForumLayout();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/forum/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--surface)',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      {/* Topbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          height: 56,
          gap: 16,
        }}
      >
        {/* Left: breadcrumb */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <Image
            src="/arcade.svg"
            alt="Arcade"
            width={90}
            height={20}
            priority
          />
        </Link>
        <span style={{ color: 'var(--border-strong)', fontSize: 18 }}>/</span>
        <Link
          href="/forum"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          Forum
        </Link>

        {/* Center: Search */}
        <form
          onSubmit={handleSearch}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            maxWidth: 400,
            position: 'relative',
          }}
        >
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts..."
            style={{
              width: '100%',
              height: 32,
              paddingLeft: 30,
              paddingRight: 12,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              fontSize: 13,
              color: 'var(--text-primary)',
              outline: 'none',
              backgroundColor: 'var(--surface)',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--arcade-blue)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
        </form>

        {/* Right: auth section */}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          {!mounted || status === 'loading' ? (
            <div style={{ width: 130, height: 32 }} />
          ) : status === 'authenticated' ? (
            <>
              <NotificationPanel />
              <NavUserMenu />
            </>
          ) : (
            <>
              <Link
                href={`/sign?returnTo=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.pathname : '/forum'
                )}`}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  padding: '6px 4px',
                }}
              >
                Sign in
              </Link>
              <Link
                href="/sign?mode=signup"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                  backgroundColor: 'var(--arcade-blue)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 16px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Join →
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <div
        style={{
          width: '100%',
          flex: 1,
          overflow: 'hidden',
          margin: '0 auto',
          padding: '28px 32px',
          display: 'flex',
          gap: 28,
          alignItems: 'flex-start',
          boxSizing: 'border-box',
        }}
      >
        <style>{`
          @keyframes forum-fade-in {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .forum-content-enter {
            animation: forum-fade-in 0.18s ease-out both;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <ForumSidebar />
        <main
          className="hide-scrollbar"
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div key={pathname} className="forum-content-enter" style={{ paddingBottom: '40px' }}>
            {children}
          </div>
        </main>
        {!hideTrending && <TrendingSidebar />}
      </div>
    </div>
  );
}
