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
import { GOOGLE_OAUTH_URL } from '@/infrastructure/config/env';
import AuthForm, { type AuthView } from '@/domains/identity/components/AuthForm';

function parseMode(raw: string | null): AuthView {
  if (raw === 'signup') return 'signup';
  if (raw === 'forgot') return 'forgot';
  if (raw === 'reset') return 'reset';
  if (raw === 'verify') return 'verify';
  return 'login';
}

function urlForMode(
  mode: AuthView,
  token?: string | null,
  redirectTarget?: string | null,
  prefillEmail?: string | null,
) {
  const params = new URLSearchParams();
  if (mode !== 'login') params.set('mode', mode);
  if ((mode === 'reset' || mode === 'verify') && token) params.set('token', token);
  if (redirectTarget) params.set('redirect', redirectTarget);
  if (prefillEmail) params.set('email', prefillEmail);
  const query = params.toString();
  return query ? `/sign?${query}` : '/sign';
}

export function AuthOrchestrator({ initialMode }: { initialMode: AuthView }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const token = searchParams.get('token');
  // `redirect` + `email` support the invite-gated channel creation flow (see
  // channel-invite/page.tsx): it sends unauthenticated users here with the page they should land
  // on after auth, and their known email prefilled, then relies on this orchestrator to send them
  // back once they're signed in.
  const redirectTarget = searchParams.get('redirect');
  const prefillEmail = searchParams.get('email') || undefined;
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
      // Manual OTP verification mode - user will enter code manually
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
    window.history.replaceState(null, '', urlForMode(newMode, token, redirectTarget, prefillEmail));
  };

  const handleSubmit = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    confirmPassword?: string;
    otp?: string;
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

        const returnTo = redirectTarget || searchParams.get('returnTo') || searchParams.get('callbackUrl');
        const safePath = returnTo?.startsWith('/') ? returnTo : '/';
        router.push(safePath);
      } else if (mode === 'signup') {
        await AuthService.register({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        });
        handleModeChange('verify');
      } else if (mode === 'verify') {
        if (!data.otp) {
          setGlobalError('Please enter the 6-digit verification code.');
          return;
        }
        await AuthService.verifyEmail(data.otp, data.email);
        setSuccessKind('verify');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          handleModeChange('login');
        }, 2500);
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
    window.location.href = GOOGLE_OAUTH_URL;
  };

  const handleResendOtp = async (email: string) => {
    try {
      await AuthService.resendVerificationCode(email);
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || err.message || 'Failed to resend code');
      throw err;
    }
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
      hasToken={!!token}
      onResendOtp={handleResendOtp}
      defaultEmail={prefillEmail}
    />
  );
}
