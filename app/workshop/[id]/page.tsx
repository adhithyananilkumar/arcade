'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { WorkshopPreview } from '@/app/(authenticated)/studio/workshop/components/wizard/review/WorkshopPreview';
import { getWorkshopPreview } from '@/app/(authenticated)/studio/workshop/api/publish';
import { WorkshopPreviewDto } from '@/app/(authenticated)/studio/workshop/types';
import Link from 'next/link';

export default function WorkshopDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [previewData, setPreviewData] = useState<WorkshopPreviewDto | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    getWorkshopPreview(id)
      .then(data => {
        setPreviewData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load workshop details:', err);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0d14] text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading workshop details...</span>
        </div>
      </div>
    );
  }

  if (error || !previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0d14] p-6 text-center text-white font-sans">
        <div className="bg-[#121624] p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-800 space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Workshop Not Found</h2>
          <p className="text-gray-400 text-sm">
            We couldn't load the details for this workshop. It may have been unpublished, deleted, or the link is invalid.
          </p>
          <Link href="/workshops" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-sm">
            Back to Workshop Discovery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0d14]">
      {/* Top Header */}
      <header className="bg-[#121624] border-b border-gray-800 text-white py-3.5 px-6 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <Link href="/workshops" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Discovery
        </Link>
        <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          Arcade Workshops
        </span>
      </header>
      
      <main>
        <WorkshopPreview preview={previewData} />
      </main>
    </div>
  );
}
