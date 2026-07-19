'use client';

import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  url?: string;
  size?: number;
}

export function ShareButton({ url, size = 14 }: Props) {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = url || window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <button
      onClick={handleShare}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '0 12px',
        height: 32,
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--surface)',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--text-muted)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
    >
      <Share2 size={size} /> Share
    </button>
  );
}
