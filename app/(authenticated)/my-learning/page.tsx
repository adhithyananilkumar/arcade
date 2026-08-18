'use client';

/**
 * Route shell only.
 *
 * The orchestration (queries, filters, pagination) lives in the learner app layer at
 * `apps/learner/components/my-learning/MyLearningPage.tsx`, matching the existing
 * `LearnerHomePage` precedent and the `app -> apps -> domains` dependency direction documented in
 * `ui/CLAUDE.md`. The previous 1,845-line version put all of it in this route file.
 */

import MyLearningPage from '@/apps/learner/components/my-learning/MyLearningPage';

export default function MyLearningRoute() {
  return <MyLearningPage />;
}
