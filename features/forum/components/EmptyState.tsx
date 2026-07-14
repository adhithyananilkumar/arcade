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
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#fafafa',
          border: '1px solid #ebebeb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MessageSquare size={26} color="#111" strokeWidth={1.5} />
      </div>
      <div>
        <p style={{ fontSize: 18, fontWeight: 650, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 6 }}>
          {title}
        </p>
        <p style={{ fontSize: 14, color: '#777', maxWidth: 320 }}>{description}</p>
      </div>
      {cta && (
        <Link
          href={cta.href}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 44,
            padding: '0 24px',
            borderRadius: 100,
            backgroundColor: '#0a0a0a',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            marginTop: 8,
          }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
