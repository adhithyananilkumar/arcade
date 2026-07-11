'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { Loader2 } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { status, setStatus, setAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (status === 'loading') {
        try {
          let { accessToken, user } = await AuthService.refresh();
          
          // Set auth immediately so apiClient can use the token
          setAuth(user || {}, accessToken);

          if (!user || Object.keys(user).length === 0) {
            try {
              // Try to fetch user from backend if missing from AuthResponse
              user = await UserService.getMe();
              setAuth(user, accessToken);
            } catch (err) {
              console.error('Failed to fetch user profile after refresh', err);
            }
          }
        } catch {
          setStatus('unauthenticated');
        }
      }
    };
    initAuth();
  }, [status, setAuth, setStatus]);

  useEffect(() => {
    if (mounted && status === 'unauthenticated' && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
      router.push('/login');
    }
  }, [mounted, status, pathname, router]);

  // Avoid hydration mismatch
  if (!mounted) return null;

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Loading Application...</p>
      </div>
    );
  }

  return status === 'authenticated' ? <>{children}</> : null;
}
