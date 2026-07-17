'use client';

import { ForumSidebar } from './ForumSidebar';
import { TrendingSidebar } from './TrendingSidebar';
import { NotificationPanel } from './NotificationPanel';
import { NavUserMenu } from './NavUserMenu';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForumLayout } from './ForumLayoutContext';

interface Props {
  children: React.ReactNode;
}

export function ForumLayout({ children }: Props) {
  const { status } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState('');
  const [mounted, setMounted] = useState(false);
  const { hideTrending } = useForumLayout();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Sync search input with URL search parameters
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setQ(query);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/forum/search?q=${encodeURIComponent(q.trim())}`);
    } else {
      router.push('/forum');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        backgroundImage: 'var(--bg-gradient)',
        fontFamily: 'var(--font-geist-sans), system-ui, -apple-system, sans-serif',
        position: 'relative',
      }}
    >
      {/* Ambient gradient to match landing page */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 10%, rgba(99,102,241,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Topbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '14px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s var(--ease-premium)',
        }}
      >
        {/* Left: Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              flexShrink: 0,
              transition: 'transform 0.2s var(--ease-premium)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Image
              src="/arcade.svg"
              alt="Arcade"
              width={96}
              height={30}
              style={{ height: 26, width: 'auto', objectFit: 'contain' }}
              priority
            />
          </Link>
          
          {/* Landing Page style links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginLeft: 16 }}>
            <Link
              href="/"
              style={{ fontSize: 13, color: '#666', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#111'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
            >
              Explore
            </Link>
            <Link
              href="/forum"
              style={{ fontSize: 13, color: '#111', textDecoration: 'none', fontWeight: 600 }}
            >
              Forum
            </Link>
            <a
              href="#"
              style={{ fontSize: 13, color: '#666', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#111'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
            >
              For Colleges
            </a>
            <a
              href="#"
              style={{ fontSize: 13, color: '#666', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#111'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
            >
              Docs
            </a>
          </div>
        </div>

        {/* Center: Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            maxWidth: 320,
            position: 'relative',
            margin: '0 32px',
          }}
        >
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 14,
              color: 'var(--text-muted)',
              pointerEvents: 'none',
              transition: 'color 0.2s var(--ease-premium)',
            }}
            className="search-icon-el"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts..."
            style={{
              width: '100%',
              height: 38,
              paddingLeft: 38,
              paddingRight: 16,
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 100,
              fontSize: 13,
              color: 'var(--text-primary)',
              fontWeight: 500,
              outline: 'none',
              backgroundColor: 'rgba(0,0,0,0.03)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
              transition: 'all 0.3s var(--ease-premium)',
            }}
            onFocus={(e) => { 
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; 
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const icon = parent.querySelector('.search-icon-el') as HTMLElement;
                if (icon) icon.style.color = 'var(--arcade-blue)';
              }
            }}
            onBlur={(e) => { 
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; 
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const icon = parent.querySelector('.search-icon-el') as HTMLElement;
                if (icon) icon.style.color = 'var(--text-muted)';
              }
            }}
          />
        </form>

        {/* Right: auth section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
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
                  color: '#666',
                  textDecoration: 'none',
                  padding: '8px 12px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#111';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#666';
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
                  transition: 'all 0.2s var(--ease-premium)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#222';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#111';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <div
        style={{
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '48px 32px 80px 32px',
          display: 'flex',
          gap: 36,
          alignItems: 'flex-start',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <style>{`
          @keyframes forum-fade-in {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .forum-content-enter {
            animation: forum-fade-in 0.4s var(--ease-premium) both;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <ForumSidebar />
        <main
          style={{
            flex: 1,
            minWidth: 0,
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
