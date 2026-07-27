'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Public
 * Type: Orchestrator
 *
 * Purpose:
 * Connects the pure UI AuthForm to API services and Next.js routing.
 * Owns login, signup, and recovery (forgot / reset / verify) on /sign.
 * ------------------------------------------------------------------
 */

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthService } from '@/infrastructure/auth/auth.service';
import AuthForm, { type AuthView } from '@/domains/identity/components/AuthForm';

function parseMode(raw: string | null): AuthView {
  if (raw === 'signup') return 'signup';
  if (raw === 'forgot') return 'forgot';
  if (raw === 'reset') return 'reset';
  if (raw === 'verify') return 'verify';
  return 'login';
}

function urlForMode(mode: AuthView, token?: string | null, returnTo?: string | null) {
  const params = new URLSearchParams();
  if (mode !== 'login') params.set('mode', mode);
  if (token) params.set('token', token);
  if (returnTo) params.set('returnTo', returnTo);
  const qs = params.toString();
  return qs ? `/sign?${qs}` : '/sign';
}

export function AuthOrchestrator({ initialMode }: { initialMode: AuthView }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const token = searchParams.get('token');
  const returnToParam = searchParams.get('returnTo') || searchParams.get('callbackUrl');

  useEffect(() => {
    if (returnToParam && returnToParam.startsWith('/')) {
      try { sessionStorage.setItem('auth_return_to', returnToParam); } catch {}
    }
  }, [returnToParam]);

  const [mode, setMode] = useState<AuthView>(initialMode);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successKind, setSuccessKind] = useState<'signup' | 'forgot' | 'reset' | 'verify'>(
    'signup',
  );
  const [globalError, setGlobalError] = useState<string | undefined>();
  const [verifyStatus, setVerifyStatus] = useState<'loading' | 'success' | 'error'>('loading');

  // Sync mode from URL (supports deep links + browser back)
  useEffect(() => {
    const next = parseMode(searchParams.get('mode'));
    setMode(next);
  }, [searchParams]);

  // Auto-run email verification when landing with token
  useEffect(() => {
    if (mode !== 'verify') return;
    if (!token) {
      setVerifyStatus('error');
      setGlobalError('No verification token provided.');
      return;
    }

    let cancelled = false;
    setVerifyStatus('loading');
    setGlobalError(undefined);

    (async () => {
      try {
        await AuthService.verifyEmail(token);
        if (!cancelled) setVerifyStatus('success');
      } catch (err: any) {
        if (!cancelled) {
          setVerifyStatus('error');
          setGlobalError(
            err.response?.data?.message ||
              err.message ||
              'Failed to verify email. The link may be expired.',
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, token]);

  const handleModeChange = (newMode: AuthView) => {
    setMode(newMode);
    setGlobalError(undefined);
    setShowSuccess(false);
    window.history.replaceState(null, '', urlForMode(newMode, token, returnToParam));
  };

  const handleSubmit = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword?: string;
  }) => {
    setGlobalError(undefined);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { user, accessToken } = await AuthService.login({
          email: data.email,
          password: data.password,
        });
        setAuth(user, accessToken);

        let safePath = '/';
        const currentReturnTo = searchParams.get('returnTo') || searchParams.get('callbackUrl') || returnToParam;
        if (currentReturnTo && currentReturnTo.startsWith('/')) {
          safePath = currentReturnTo;
        } else {
          try {
            const stored = sessionStorage.getItem('auth_return_to');
            if (stored && stored.startsWith('/')) {
              safePath = stored;
            }
          } catch {}
        }
        try { sessionStorage.removeItem('auth_return_to'); } catch {}
        router.push(safePath);
      } else if (mode === 'signup') {
        await AuthService.register({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        });
        setSuccessKind('signup');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          handleModeChange('login');
        }, 3500);
      } else if (mode === 'forgot') {
        await AuthService.forgotPassword(data.email);
        setSuccessKind('forgot');
        setShowSuccess(true);
      } else if (mode === 'reset') {
        if (!token) {
          setGlobalError('Invalid or missing password reset token.');
          return;
        }
        await AuthService.resetPassword(token, data.password);
        setSuccessKind('reset');
        setShowSuccess(true);
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
      successKind={successKind}
      globalError={globalError}
      verifyStatus={verifyStatus}
      onModeChange={handleModeChange}
      onSubmit={handleSubmit}
      onGoogleLogin={handleGoogleLogin}
    />
  );
}
