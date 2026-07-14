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
        backgroundColor: '#ffffff',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        position: 'relative',
      }}
    >
      {/* Ambient gradient to match landing page */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(99,102,241,0.09) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Topbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          height: 64,
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
              height: 38,
              paddingLeft: 34,
              paddingRight: 14,
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 100,
              fontSize: 13,
              color: '#111',
              outline: 'none',
              backgroundColor: '#fafafa',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => { 
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; 
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
            }}
            onBlur={(e) => { 
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; 
              e.currentTarget.style.backgroundColor = '#fafafa';
              e.currentTarget.style.boxShadow = 'none';
            }}
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
                href={`/login?returnTo=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.pathname : '/forum'
                )}`}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#444',
                  textDecoration: 'none',
                  padding: '6px 4px',
                }}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                  backgroundColor: '#111',
                  borderRadius: 100,
                  padding: '8px 20px',
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
