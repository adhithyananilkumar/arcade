'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWebSocket } from '../hooks/useWebSocket';
import { useCastPollVote } from '../api/forum.queries';
import type { PollResponse } from '../types/forum.types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Props {
  postId: number;
  poll: PollResponse;
}

export function PollCard({ postId, poll: initialPoll }: Props) {
  const [poll, setPoll] = useState<PollResponse>(initialPoll);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const castVote = useCastPollVote();
  const { subscribe, clientRef } = useWebSocket();

  // Sync state if initialPoll changes
  useEffect(() => {
    setPoll(initialPoll);
  }, [initialPoll]);

  // Subscribe to live poll updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (clientRef.current?.connected) {
        clearInterval(interval);
        const unsub = subscribe(`/topic/posts/${postId}/poll`, (body: unknown) => {
          const updatedPoll = body as PollResponse;
          if (updatedPoll && updatedPoll.id === poll.id) {
            setPoll(updatedPoll);
          }
        });
        return () => unsub();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [postId, poll.id, subscribe, clientRef]);

  // Auto-submit debounce timer for multiple-answer polls
  useEffect(() => {
    if (!poll.allowMultipleAnswers || selectedOptionIds.length === 0 || poll.userVoted || poll.isExpired || castVote.isPending) {
      return;
    }

    const timer = setTimeout(() => {
      castVote.mutate({ postId, optionIds: selectedOptionIds });
    }, 1200); // Auto-submit after 1.2 seconds of no clicks

    return () => clearTimeout(timer);
  }, [selectedOptionIds, poll.allowMultipleAnswers, poll.userVoted, poll.isExpired, castVote, postId]);

  const handleOptionToggle = (optionId: number) => {
    if (poll.userVoted || poll.isExpired || castVote.isPending) return;

    if (poll.allowMultipleAnswers) {
      setSelectedOptionIds(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptionIds([optionId]);
      // Submit single choice instantly
      castVote.mutate({ postId, optionIds: [optionId] });
    }
  };

  const hasExpired = poll.isExpired;
  const isVoted = poll.userVoted;
  const showResults = isVoted || hasExpired;
  const totalVotes = poll.totalVotes || 0;

  // Modern gradient color palette for progress bars
  const colors = [
    'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%)', // Violet to Blue
    'linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)', // Pink to Violet
    'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)', // Cyan to Blue
    'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)', // Emerald to Cyan
    'linear-gradient(90deg, #f59e0b 0%, #ec4899 100%)', // Amber to Pink
    'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)', // Indigo to Purple
  ];

  return (
    <div style={{
      padding: '24px 28px',
      borderRadius: 'var(--radius-xl)',
      backgroundColor: 'rgba(255, 255, 255, 0.45)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border)',
      marginTop: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxShadow: 'var(--shadow-premium)',
    }}>
      {/* Expiry Header */}
      {hasExpired && (
        <div style={{
          alignSelf: 'flex-start',
          fontSize: 11,
          fontWeight: 700,
          color: '#ef4444',
          backgroundColor: '#fee2e2',
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          Poll Closed
        </div>
      )}

      {/* Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {poll.options.map((option, index) => {
          const voteCount = option.voteCount || 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isSelected = selectedOptionIds.includes(option.id);
          const color = colors[index % colors.length];

          if (showResults) {
            return (
              <div
                key={option.id}
                style={{
                  position: 'relative',
                  height: 46,
                  borderRadius: 'var(--radius-lg)',
                  border: option.userVoted ? '1.5px solid var(--arcade-blue)' : '1px solid rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px',
                  backgroundColor: option.userVoted ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.55)',
                  boxShadow: option.userVoted ? 'var(--shadow-xs)' : 'none',
                }}
              >
                {/* Animated Background Progress Bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    background: color,
                    opacity: 0.16,
                    zIndex: 0,
                  }}
                />

                {/* Option text */}
                <div style={{
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  fontWeight: option.userVoted ? 700 : 550,
                  color: 'var(--text-primary)',
                }}>
                  {option.optionText}
                  {option.userVoted && (
                    <span style={{ fontSize: 11, color: 'var(--arcade-blue)', fontWeight: 700, backgroundColor: 'rgba(99, 102, 241, 0.08)', padding: '1px 6px', borderRadius: 100 }}>(your choice)</span>
                  )}
                </div>

                {/* Votes Count */}
                <div style={{
                  zIndex: 1,
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  {percentage}% ({voteCount})
                </div>
              </div>
            );
          }

          // Voting Mode UI
          const isProcessingThis = isSelected && castVote.isPending;
          return (
            <div
              key={option.id}
              onClick={() => handleOptionToggle(option.id)}
              style={{
                height: 46,
                borderRadius: 'var(--radius-lg)',
                border: isSelected ? '1.5px solid var(--arcade-blue)' : '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.55)',
                cursor: castVote.isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s var(--ease-premium)',
                boxShadow: isSelected ? 'var(--shadow-xs)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !castVote.isPending) {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.55)';
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* Checkbox / Radio indicator */}
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: poll.allowMultipleAnswers ? 4 : '50%',
                  border: '1.5px solid var(--border-strong)',
                  marginRight: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? 'var(--arcade-blue)' : '#fff',
                  borderColor: isSelected ? 'var(--arcade-blue)' : 'var(--border-strong)',
                  transition: 'all 0.2s var(--ease-premium)',
                }}>
                  {isSelected && !isProcessingThis && (
                    <div style={{
                      width: poll.allowMultipleAnswers ? 8 : 6,
                      height: poll.allowMultipleAnswers ? 8 : 6,
                      borderRadius: poll.allowMultipleAnswers ? 1 : '50%',
                      backgroundColor: '#fff',
                    }} />
                  )}
                </div>

                {/* Option Text */}
                <span style={{ fontSize: 14, fontWeight: 550, color: 'var(--text-primary)' }}>
                  {option.optionText}
                </span>
              </div>

              {isProcessingThis && (
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--arcade-blue)' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer information */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
      }}>
        {/* Total Vote count label */}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {totalVotes} {totalVotes === 1 ? 'vote cast' : 'votes cast'}
        </span>
      </div>
    </div>
  );
}
