'use client';

import Link from 'next/link';
import { useTrendingTags } from '../api/forum.queries';
import { useAuthStore } from '@/store/auth.store';
import { TrendingUp } from 'lucide-react';

export function TrendingSidebar() {
  const { data: tags } = useTrendingTags(10);
  

  return (
    <aside style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 100 }}>
      {/* Trending tags */}
      {tags && tags.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-premium)',
            overflow: 'hidden',
            transition: 'all 0.3s var(--ease-premium)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-premium-hover)';
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.15)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
            e.currentTarget.style.borderColor = 'var(--glass-border)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--glass-border-dark)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <TrendingUp size={14} style={{ color: 'var(--arcade-blue)' }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 750,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--text-secondary)',
              }}
            >
              Trending Tags
            </span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/forum/t/${tag.slug}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 18px',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  transition: 'all 0.2s var(--ease-premium)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
                  e.currentTarget.style.paddingLeft = '22px';
                  const label = e.currentTarget.querySelector('.tag-name-label') as HTMLElement;
                  if (label) label.style.color = 'var(--arcade-blue)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.paddingLeft = '18px';
                  const label = e.currentTarget.querySelector('.tag-name-label') as HTMLElement;
                  if (label) label.style.color = 'var(--text-primary)';
                }}
              >
                <span className="tag-name-label" style={{ fontWeight: 550, transition: 'color 0.2s var(--ease-premium)' }}>
                  #{tag.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', backgroundColor: 'rgba(0,0,0,0.03)', padding: '2px 8px', borderRadius: 100 }}>
                  {tag.postCount}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
