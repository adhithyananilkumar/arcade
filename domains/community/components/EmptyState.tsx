'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

interface Props {
  title?: string;
  description?: string;
  cta?: { label: string; href: string };
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'Be the first to start a conversation.',
  cta,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '64px 24px',
        gap: 16,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--arcade-blue-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MessageSquare size={24} color="var(--arcade-blue)" />
      </div>
      <div>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
          {title}
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 320 }}>{description}</p>
      </div>
      {cta && (
        <Link
          href={cta.href}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 36,
            padding: '0 16px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--arcade-blue)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
