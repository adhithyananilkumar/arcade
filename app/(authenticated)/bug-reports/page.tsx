'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App (routing only)
 *
 * Purpose:
 * /bug-reports — the signed-in account's own bug reports. The backend only ever returns the
 * caller's reports, so there is no gate here.
 * ------------------------------------------------------------------
 */

import { Suspense } from 'react';
import { MyBugReportsPage } from '@/apps/core/components/bug-reports/MyBugReportsPage';

export default function BugReportsRoute() {
  return (
    <Suspense fallback={null}>
      <MyBugReportsPage />
    </Suspense>
  );
}
