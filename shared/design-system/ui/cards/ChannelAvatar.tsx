'use client';

import React from 'react';
import { cn } from '@/shared/utils/utils';

export interface ChannelAvatarProps {
  name: string;
  /** The channel's picture. For a personal channel the backend already sends the owner's. */
  iconUrl?: string | null;
  /** Diameter in px. */
  size?: number;
  className?: string;
}

/**
 * A channel's picture, or its initials on a disc of the same size when it has none (or the image
 * fails to load) — so every byline keeps the same shape whether or not a picture exists.
 */
export function ChannelAvatar({ name, iconUrl, size = 20, className }: ChannelAvatarProps) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [iconUrl]);

  const style = { width: size, height: size };
  if (iconUrl && !failed) {
    return (
      <img
        src={iconUrl}
        alt=""
        onError={() => setFailed(true)}
        style={style}
        className={cn(
          'shrink-0 rounded-full object-contain',
          className
        )}
      />
    );
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
  return (
    <span
      aria-hidden
      style={{ ...style, fontSize: Math.max(8, Math.round(size * 0.4)) }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 font-bold text-indigo-600 dark:text-indigo-300 dark:border-indigo-500/25 dark:bg-indigo-500/10',
        className
      )}
    >
      {initials}
    </span>
  );
}
