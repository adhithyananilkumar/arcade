'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReviewApi, ReviewWorkspaceResponse } from '@/shared/api/review.api';
import { ReviewWorkspaceState } from '@/shared/types/review.types';
import { CourseRenderMode } from '@/shared/types/course.types';
import { notFound } from 'next/navigation';

const ReviewWorkspaceContext = createContext<ReviewWorkspaceState | undefined>(undefined);

export function ReviewWorkspaceProvider({
  roundId,
  children,
}: {
  roundId: string;
  children: ReactNode;
}) {
  const { data, isLoading, error, refetch } = useQuery<ReviewWorkspaceResponse, Error>({
    queryKey: ['review-workspace', roundId],
    queryFn: () => ReviewApi.getReviewWorkspace(roundId),
  });

  if (error && (error as any).response?.status === 404) {
    notFound();
  }

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Auto-select first lesson when workspace loads
  useEffect(() => {
    if (data?.courseVersionSnapshot && !selectedItemId) {
      try {
        const snapshot = JSON.parse(data.courseVersionSnapshot);
        if (snapshot.modules?.[0]?.lessons?.[0]) {
          setSelectedItemId(snapshot.modules[0].lessons[0].id);
        } else if (snapshot.modules?.[0]?.quizzes?.[0]) {
          setSelectedItemId(snapshot.modules[0].quizzes[0].id);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [data, selectedItemId]);

  const state: ReviewWorkspaceState = {
    workspace: data || null,
    isLoading,
    error,
    refresh: refetch,
    selectedItemId,
    setSelectedItemId,
  };

  return (
    <ReviewWorkspaceContext.Provider value={state}>
      {children}
    </ReviewWorkspaceContext.Provider>
  );
}

export function useReviewWorkspace() {
  const context = useContext(ReviewWorkspaceContext);
  if (context === undefined) {
    throw new Error('useReviewWorkspace must be used within a ReviewWorkspaceProvider');
  }
  return context;
}
