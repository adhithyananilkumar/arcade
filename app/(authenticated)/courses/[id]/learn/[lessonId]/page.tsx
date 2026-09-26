'use client';

import { useParams } from 'next/navigation';
import { CoursePlayer } from './CoursePlayer';

export default function CourseLearnPage() {
  const params = useParams();
  const courseId = params?.id as string | undefined;
  const lessonId = params?.lessonId as string | undefined;

  return <CoursePlayer courseId={courseId} lessonId={lessonId} isPreview={false} />;
}
