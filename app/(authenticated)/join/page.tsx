'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { OrganizationService } from '@/services/organization.service';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function JoinOrganizationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No invitation token provided in the URL.');
      return;
    }

    acceptInvite();
  }, [token]);

  const acceptInvite = async () => {
    try {
      await OrganizationService.acceptInvitation(token as string);
      setStatus('success');
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/organizations');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to accept invitation. It may have expired.');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
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
            <h2 className="text-xl font-bold text-gray-900">Accepting Invitation...</h2>
            <p className="text-sm text-gray-500 mt-2">Please wait while we add you to the organization.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="mb-4 rounded-full bg-emerald-50 p-4 text-emerald-500">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Invitation Accepted!</h2>
            <p className="text-sm text-gray-500 mt-2">You have successfully joined the organization. Redirecting you to your dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="mb-4 rounded-full bg-red-50 p-4 text-red-500">
              <XCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Invitation Failed</h2>
            <p className="text-sm text-gray-500 mt-2">{errorMessage}</p>
            
            <Link 
              href="/dashboard/organizations"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
export default function JoinOrganizationPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>}>
      <JoinOrganizationContent />
    </Suspense>
  );
}
