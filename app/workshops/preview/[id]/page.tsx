'use client';

import React, { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { WorkshopPreview } from '@/app/(authenticated)/studio/workshop/components/wizard/review/WorkshopPreview';
import { getWorkshopPreview } from '@/app/(authenticated)/studio/workshop/api/publish';
import { WorkshopPreviewDto } from '@/app/(authenticated)/studio/workshop/types';

interface Props {
  params: {
    id: string;
  };
}

export default function PublicPreviewPage({ params }: Props) {
  const { id } = params;
  const [previewData, setPreviewData] = useState<WorkshopPreviewDto | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!id) {
      notFound();
      return;
    }
    
    getWorkshopPreview(id)
      .then(data => {
        setPreviewData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load workshop preview:', err);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">Loading preview...</div>;
  }

  if (error || !previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 text-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Preview Not Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't load the preview for this workshop. It may have been deleted or the ID is invalid.
          </p>
          <a href="/studio" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm">
            Return to Studio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-indigo-600 text-white py-3 px-6 text-center font-medium shadow-md flex justify-between items-center relative z-10">
        <span className="flex-1 text-left font-bold text-xl tracking-tight">Arcade</span>
        <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-white/30 backdrop-blur-sm">
          Creator Preview Mode
        </span>
        <span className="flex-1 text-right text-sm text-indigo-200">
          This is how your workshop will appear to learners
        </span>
      </header>
      
      <main>
        <WorkshopPreview preview={previewData} />
      </main>
    </div>
  );
}
