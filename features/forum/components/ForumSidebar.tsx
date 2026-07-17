'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutList, BookMarked } from 'lucide-react';
import { useCategories } from '../api/forum.queries';

const navItems = [
  { label: 'All Posts', href: '/forum', icon: LayoutList },
  { label: 'Bookmarks', href: '/forum/bookmarks', icon: BookMarked },
];

export function ForumSidebar() {
  const pathname = usePathname();
  const { data: categories } = useCategories();

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        position: 'sticky',
        top: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 16px',
        boxShadow: 'var(--shadow-premium)',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        height: 'fit-content',
        transition: 'all 0.3s var(--ease-premium)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-premium-hover)';
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
        e.currentTarget.style.borderColor = 'var(--glass-border)';
      }}
    >
      {/* Nav */}
      <div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: active ? 650 : 500,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: active ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  border: active ? '1px solid rgba(99, 102, 241, 0.15)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.25s var(--ease-premium)',
                  boxShadow: active ? '0 4px 12px rgba(99, 102, 241, 0.04)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.04)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  } else {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  } else {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <Icon size={15} style={{ color: active ? '#4f46e5' : 'inherit', transition: 'color 0.2s' }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 750,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              marginBottom: 12,
              padding: '0 16px',
            }}
          >
            Categories
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {categories.map((cat) => {
              const active = pathname === `/forum/c/${cat.slug}`;
              const colors: Record<string, string> = {
                'technology': '#3b82f6',
                'ai-ml': '#8b5cf6',
                'education': '#10b981',
                'careers': '#f59e0b',
                'projects': '#ec4899',
                'ask-anything': '#06b6d4',
                'news-updates': '#ef4444',
                'off-topic': '#6b7280',
              };
              const bulletColor = colors[cat.slug] || '#aaa';
              return (
                <Link
                  key={cat.id}
                  href={`/forum/c/${cat.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 14px',
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: active ? 650 : 500,
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    backgroundColor: active ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
                    border: active ? '1px solid rgba(99, 102, 241, 0.12)' : '1px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.25s var(--ease-premium)',
                    boxShadow: active ? '0 4px 12px rgba(99, 102, 241, 0.02)' : 'none',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.04)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.paddingLeft = '18px';
                    } else {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.paddingLeft = '14px';
                    } else {
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <span 
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: bulletColor,
                      flexShrink: 0,
                      boxShadow: active ? `0 0 10px ${bulletColor}` : `0 0 4px ${bulletColor}40`,
                      transition: 'transform 0.2s',
                    }} 
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </aside>
  );
}
