'use client';

import type { BadgeLevel } from '../types/forum.types';

const config: Record<BadgeLevel, { color: string; bg: string }> = {
  NEWCOMER: { color: '#8896ab', bg: '#f1f4fa' },
  CONTRIBUTOR: { color: '#205ca8', bg: '#ebf0fa' },
  TRUSTED: { color: '#16a34a', bg: '#ecfdf5' },
  EXPERT: { color: '#d97706', bg: '#fffbeb' },
};

export function ReputationBadge({ badge, points }: { badge: BadgeLevel; points: number }) {
  const c = config[badge] || config.NEWCOMER;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize: 10,
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        padding: '1px 6px',
        color: c.color,
        backgroundColor: c.bg,
      }}
    >
      {points}
    </span>
  );
}
