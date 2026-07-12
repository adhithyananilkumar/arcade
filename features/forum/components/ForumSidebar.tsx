'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutList, BookMarked, Users } from 'lucide-react';
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
        width: 220,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Logo */}
      <div>
        <Link
          href="/forum"
          style={{
            display: 'block',
            textDecoration: 'none',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: 'var(--arcade-blue)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Arcade Forum
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              marginTop: 2,
            }}
          >
            by Amal Jyothi
          </div>
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  gap: 8,
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--arcade-blue)' : 'var(--text-secondary)',
                  backgroundColor: active ? 'var(--arcade-blue-light)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.12s',
                }}
              >
                <Icon size={15} />
                {item.label}
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
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              marginBottom: 8,
              padding: '0 10px',
            }}
          >
            Categories
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {categories.map((cat) => {
              const active = pathname === `/forum/c/${cat.slug}`;
              return (
                <Link
                  key={cat.id}
                  href={`/forum/c/${cat.slug}`}
                  style={{
                    display: 'block',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--arcade-blue)' : 'var(--text-secondary)',
                    backgroundColor: active ? 'var(--arcade-blue-light)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.12s',
                  }}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </aside>
  );
}
