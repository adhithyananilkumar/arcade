'use client';

import Link from 'next/link';
import { useTrendingTags } from '../api/forum.queries';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { TrendingUp } from 'lucide-react';

export function TrendingSidebar() {
  const { data: tags } = useTrendingTags(10);
  

  return (
    <aside style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Trending tags */}
      {tags && tags.length > 0 && (
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <TrendingUp size={14} color="var(--text-muted)" />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
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
                  padding: '7px 16px',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    'var(--surface-hover)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent')
                }
              >
                <span style={{ fontWeight: 500 }}>#{tag.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
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
