'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Route: /courses/[id]
 *
 * Purpose:
 * Entry route for public course landing & overview.
 * Delegates rendering to the dedicated CoursePublicView domain component.
 * ------------------------------------------------------------------
 */

import { useParams } from 'next/navigation';
import { CoursePublicView } from '@/domains/courses';

export default function CoursePage() {
  const params = useParams<{ id?: string }>();
  return <CoursePublicView courseId={params?.id} />;
}
