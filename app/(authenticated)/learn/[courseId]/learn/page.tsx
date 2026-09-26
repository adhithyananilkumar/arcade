'use client';

import { useParams } from 'next/navigation';
import { CoursePlayer } from './CoursePlayer';

export default function CourseLearnPage() {
  const params = useParams();
  const courseId = params?.courseId as string | undefined;

  return <CoursePlayer courseId={courseId} isPreview={false} />;
}
