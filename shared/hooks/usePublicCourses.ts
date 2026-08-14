'use client';

import { useEffect, useState } from 'react';
import { api } from '@/infrastructure/http/api';
import type { CourseResponse } from '@/shared/types/api.types';

export function usePublicCourses(): CourseResponse[] {
  const [courses, setCourses] = useState<CourseResponse[]>([]);

  useEffect(() => {
    api
      .get<CourseResponse[]>('/api/v1/public/courses')
      .then((res) => setCourses(res || []))
      .catch(() => setCourses([]));
  }, []);

  return courses;
}
