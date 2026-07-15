'use client';

import Link from 'next/link';

interface Props {
  slug: string;
  name: string;
}

export function TagBadge({ slug, name }: Props) {
  return (
    <Link
      href={`/forum/t/${slug}`}
      style={{
        display: 'inline-block',
        backgroundColor: 'var(--arcade-blue-light)',
        color: 'var(--arcade-blue)',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        borderRadius: 'var(--radius-full)',
        padding: '2px 8px',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s',
      }}
    >
      {name}
    </Link>
  );
}
