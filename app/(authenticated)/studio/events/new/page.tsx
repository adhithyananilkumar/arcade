'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This route is deprecated — workshop creation is now a modal on /studio
export default function NewEventRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/studio');
  }, [router]);
  return null;
}
