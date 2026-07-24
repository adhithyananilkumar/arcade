'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyCoursesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/my-learning');
  }, [router]);

  return null;
}
