'use client';

import { displayName } from '../utils/display';

interface Props {
  username: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = { sm: 24, md: 32, lg: 40, xl: 64 };
const fontSizes = { sm: 10, md: 12, lg: 15, xl: 22 };

export function UserAvatar({ username, avatarUrl, size = 'md' }: Props) {
  const px = sizes[size];
  const fs = fontSizes[size];
  const name = displayName(username);
  const initials = name.slice(0, 1).toUpperCase();

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        style={{
          width: px,
          height: px,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: px,
        height: px,
        borderRadius: '50%',
        backgroundColor: 'var(--arcade-blue-light)',
        color: 'var(--arcade-blue)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: fs,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: '-0.01em',
      }}
    >
      {initials}
    </div>
  );
}
