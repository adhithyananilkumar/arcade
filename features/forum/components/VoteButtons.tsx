'use client';

import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { useVote } from '../api/forum.queries';
import type { TargetType, VoteType } from '../types/forum.types';

interface Props {
  targetType: TargetType;
  targetId: number;
  upvotes: number;
  downvotes: number;
  userVote?: VoteType;
  orientation?: 'vertical' | 'horizontal';
  onOptimisticUpdate?: (vote: VoteType | undefined, upvotes: number, downvotes: number) => void;
}

export function VoteButtons({
  targetType,
  targetId,
  upvotes,
  downvotes,
  userVote,
  orientation = 'vertical',
}: Props) {
  const { status } = useAuthStore();
  const vote = useVote();

  const handleVote = (type: VoteType) => {
    if (status !== 'authenticated') {
      toast.error('Sign in to vote');
      return;
    }
    vote.mutate({ targetType, targetId, payload: { voteType: type } });
  };

  const netVotes = upvotes - downvotes;

  const isRow = orientation === 'horizontal';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isRow ? 'row' : 'column',
        alignItems: 'center',
        gap: isRow ? 6 : 2,
      }}
    >
      <motion.button
        whileTap={{ scale: 1.25 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('UP'); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: userVote === 'UP' ? 'var(--arcade-blue)' : 'transparent',
          color: userVote === 'UP' ? '#fff' : 'var(--vote-neutral)',
          transition: 'all 0.15s',
        }}
      >
        <ChevronUp size={16} />
      </motion.button>

      <span
        style={{
          fontSize: isRow ? 13 : 12,
          fontWeight: 600,
          color: userVote === 'UP'
            ? 'var(--upvote)'
            : userVote === 'DOWN'
            ? 'var(--downvote)'
            : 'var(--text-secondary)',
          minWidth: 24,
          textAlign: 'center',
        }}
      >
        {netVotes}
      </span>

      <motion.button
        whileTap={{ scale: 1.25 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote('DOWN'); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: userVote === 'DOWN' ? 'var(--downvote)' : 'transparent',
          color: userVote === 'DOWN' ? '#fff' : 'var(--vote-neutral)',
          transition: 'all 0.15s',
        }}
      >
        <ChevronDown size={16} />
      </motion.button>
    </div>
  );
}
