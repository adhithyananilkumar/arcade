'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuthService } from '@/services/auth.service';
import { Suspense } from 'react';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token provided.');
      return;
    }

    verify();
  }, [token]);

  const verify = async () => {
    try {
      await AuthService.verifyEmail(token as string);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to verify email. The token may be expired.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl shadow-indigo-100/50"
      >
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="mb-4 rounded-full bg-indigo-50 p-4 text-indigo-600">
              <Loader2 className="animate-spin" size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Verifying Email...</h2>
            <p className="text-sm text-gray-500 mt-2">Please wait while we confirm your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="mb-4 rounded-full bg-emerald-50 p-4 text-emerald-500">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="text-sm text-gray-500 mt-2">Your email address has been successfully verified.</p>
            
            <Link 
              href="/dashboard"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="mb-4 rounded-full bg-red-50 p-4 text-red-500">
              <XCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-sm text-gray-500 mt-2">{errorMessage}</p>
            
            <Link 
              href="/login"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Return to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
