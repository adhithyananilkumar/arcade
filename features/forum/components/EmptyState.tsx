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
        padding: '80px 40px',
        gap: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-premium)',
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <MessageSquare size={30} style={{ color: 'var(--arcade-blue)' }} strokeWidth={1.5} />
      </div>
      <div>
        <h3 style={{ fontSize: 19, fontWeight: 750, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.5 }}>{description}</p>
      </div>
      {cta && (
        <Link
          href={cta.href}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 40,
            padding: '0 24px',
            borderRadius: 100,
            background: 'var(--btn-gradient-indigo)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 650,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
            marginTop: 8,
            transition: 'all 0.25s var(--ease-premium)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
            e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.2)';
          }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
