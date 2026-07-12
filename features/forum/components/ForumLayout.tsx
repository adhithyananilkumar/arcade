'use client';

import { ForumSidebar } from './ForumSidebar';
import { TrendingSidebar } from './TrendingSidebar';
import { NotificationPanel } from './NotificationPanel';
import { NavUserMenu } from './NavUserMenu';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Props {
  children: React.ReactNode;
  hideTrendingSidebar?: boolean;
}

export function ForumLayout({ children, hideTrendingSidebar }: Props) {
  const { status } = useAuthStore();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/forum/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
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
            fontSize: 15,
            fontWeight: 800,
            color: 'var(--arcade-blue)',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
            flexShrink: 0,
          }}
        >
          Arcade
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
                href="/login"
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
                href="/register"
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
          maxWidth: 1200,
          margin: '0 auto',
          padding: '28px 24px',
          display: 'flex',
          gap: 28,
          alignItems: 'flex-start',
        }}
      >
        <ForumSidebar />
        <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
        {!hideTrendingSidebar && <TrendingSidebar />}
      </div>
    </div>
  );
}
