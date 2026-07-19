'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthService } from '@/infrastructure/auth/auth.service';
import AuthForm from '@/domains/identity/components/AuthForm';

export function AuthOrchestrator({ initialMode }: { initialMode: 'login' | 'signup' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>();

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setGlobalError(undefined);
    if (newMode === 'signup') {
      window.history.replaceState(null, '', '/sign?mode=signup');
    } else {
      window.history.replaceState(null, '', '/sign');
    }
  };

  const handleSubmit = async (data: any) => {
    setGlobalError(undefined);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { user, accessToken } = await AuthService.login({ email: data.email, password: data.password });
        setAuth(user, accessToken);
        
        const returnTo = searchParams.get('returnTo') || searchParams.get('callbackUrl');
        const safePath = returnTo?.startsWith('/') ? returnTo : '/dashboard';
        router.push(safePath);
      } else {
        await AuthService.register({ firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password });
        setShowSuccess(true);
        
        setTimeout(() => {
          setShowSuccess(false);
          handleModeChange('login');
        }, 3500);
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <AuthForm
      mode={mode}
      loading={loading}
      showSuccess={showSuccess}
      globalError={globalError}
      onModeChange={handleModeChange}
      onSubmit={handleSubmit}
      onGoogleLogin={handleGoogleLogin}
    />
  );
}
