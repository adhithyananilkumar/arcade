'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { useVote } from '../api/forum.queries';
import type { TargetType, VoteType } from '../types/forum.types';

interface Props {
  targetType: TargetType;
  targetId: number;
  upvotes: number;
  downvotes: number;
  userVote?: VoteType | boolean;
}

export function VoteButtons({
  targetType,
  targetId,
  upvotes,
  downvotes,
  userVote,
}: Props) {
  const { status } = useAuthStore();
  const vote = useVote();

  const normalizedUserVote: VoteType | undefined =
    userVote === true ? 'UP' : userVote === false ? 'DOWN' : userVote;

  const [localUpvotes, setLocalUpvotes] = useState(upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(downvotes);
  const [localUserVote, setLocalUserVote] = useState<VoteType | undefined>(normalizedUserVote);

  const [prevUpvotes, setPrevUpvotes] = useState(upvotes);
  const [prevUserVote, setPrevUserVote] = useState(normalizedUserVote);

  if (upvotes !== prevUpvotes || normalizedUserVote !== prevUserVote) {
    setLocalUpvotes(upvotes);
    setLocalDownvotes(downvotes);
    setLocalUserVote(normalizedUserVote);
    setPrevUpvotes(upvotes);
    setPrevUserVote(normalizedUserVote);
  }

  const handleVote = (type: VoteType) => {
    if (status !== 'authenticated') {
      toast.error('Sign in to vote');
      return;
    }

    // Save original for rollback
    const origUp = localUpvotes;
    const origDown = localDownvotes;
    const origVote = localUserVote;

    // Optimistic update
    if (localUserVote === type) {
      // Toggle off
      setLocalUserVote(undefined);
      if (type === 'UP') setLocalUpvotes(v => v - 1);
      else setLocalDownvotes(v => v - 1);
    } else {
      // Switch or new vote
      if (localUserVote === 'UP') setLocalUpvotes(v => v - 1);
      if (localUserVote === 'DOWN') setLocalDownvotes(v => v - 1);
      setLocalUserVote(type);
      if (type === 'UP') setLocalUpvotes(v => v + 1);
      else setLocalDownvotes(v => v + 1);
    }

    vote.mutate(
      { targetType, targetId, payload: { voteType: type } },
      {
        onError: () => {
          // Revert
          setLocalUpvotes(origUp);
          setLocalDownvotes(origDown);
          setLocalUserVote(origVote);
          toast.error('Vote failed');
        },
      }
    );
  };

  const upvoted = localUserVote === 'UP';
  const downvoted = localUserVote === 'DOWN';

  const score = localUpvotes - localDownvotes;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 32,
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-full)',
      backgroundColor: 'var(--surface)',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Upvote */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          handleVote('UP');
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: '100%',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: upvoted ? '#EBF0FA' : 'transparent',
          color: upvoted ? '#205CA8' : 'var(--text-muted)',
          transition: 'all 0.15s',
        }}
      >
        <ThumbsUp 
          size={14} 
          color={upvoted ? '#205CA8' : 'currentColor'}
          style={{
            fill: upvoted ? '#205CA8' : 'none',
            strokeWidth: upvoted ? 0 : 2,
          }}
        />
      </motion.button>

      {/* Score */}
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        minWidth: 24,
        textAlign: 'center',
        padding: '0 4px',
        color: upvoted ? '#205CA8' : downvoted ? '#DC2626' : 'var(--text-primary)',
        transition: 'color 0.15s',
      }}>
        {score}
      </span>

      {/* Downvote */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          handleVote('DOWN');
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: '100%',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: downvoted ? '#FEF2F2' : 'transparent',
          color: downvoted ? '#DC2626' : 'var(--text-muted)',
          transition: 'all 0.15s',
        }}
      >
        <ThumbsDown 
          size={14} 
          color={downvoted ? '#DC2626' : 'currentColor'}
          style={{
            fill: downvoted ? '#DC2626' : 'none',
            strokeWidth: downvoted ? 0 : 2,
          }}
        />
      </motion.button>
    </div>
  );
}
