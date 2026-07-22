import React, { useState, useEffect } from 'react';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';
import { PublishingChecklist } from './PublishingChecklist';
import { WorkshopPreview } from './WorkshopPreview';
import { validateWorkshop, publishWorkshop, archiveWorkshop, duplicateWorkshop, getWorkshopPreview } from '@/app/(authenticated)/studio/workshop/api/publish';
import { PublishValidationResponse, WorkshopPreviewDto } from '@/app/(authenticated)/studio/workshop/types';
import { useRouter } from 'next/navigation';

interface Props {
  form: ReturnType<typeof useWorkshopForm>;
  onNavigateToStep: (step: number) => void;
}

export const ReviewStep: React.FC<Props> = ({ form, onNavigateToStep }) => {
  const router = useRouter();
  const [validation, setValidation] = useState<PublishValidationResponse | null>(null);
  const [preview, setPreview] = useState<WorkshopPreviewDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Cast to any to check if an ID exists (i.e. if the draft was saved to backend)
  const workshopId = (form.formData as any).id;

  useEffect(() => {
    if (!workshopId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [valData, previewData] = await Promise.all([
          validateWorkshop(workshopId),
          getWorkshopPreview(workshopId)
        ]);
        setValidation(valData);
        setPreview(previewData);
      } catch (e) {
        console.error('Failed to load review data', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [workshopId]);

  const handlePublish = async () => {
    if (!workshopId) return;
    setIsPublishing(true);
    try {
      await publishWorkshop(workshopId);
      alert('Workshop published successfully!');
      router.push('/studio/workshop');
    } catch (e) {
      alert('Failed to publish workshop.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleArchive = async () => {
    if (!workshopId) return;
    setIsArchiving(true);
    try {
      await archiveWorkshop(workshopId);
      alert('Workshop archived.');
      router.push('/studio/workshop');
    } catch (e) {
      alert('Failed to archive workshop.');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!workshopId) return;
    setIsDuplicating(true);
    try {
      const copy = await duplicateWorkshop(workshopId);
      alert('Workshop duplicated.');
      router.push(`/studio/workshop/new?id=${copy.id}`);
    } catch (e) {
      alert('Failed to duplicate workshop.');
    } finally {
      setIsDuplicating(false);
    }
  };

  if (!workshopId) {
    return (
      <div className="p-8 text-center bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-400 font-medium">Please save your draft first!</p>
        <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-2">You need to save this workshop to the server before you can review and publish it.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading review data...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Preview Area */}
      <div className="flex-1 lg:max-w-3xl space-y-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Preview</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {preview ? <WorkshopPreview preview={preview} /> : <div className="p-6">Unable to load preview</div>}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
        
        {/* Checklist */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <PublishingChecklist validation={validation} onNavigateToStep={onNavigateToStep} />
        </div>

        {/* Actions */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={handlePublish}
              disabled={!validation?.isReady || isPublishing}
              className={`w-full py-2.5 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors ${
                validation?.isReady
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white dark:ring-offset-gray-900'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {isPublishing ? 'Publishing...' : 'Publish Workshop'}
            </button>
            <button
              onClick={() => alert('Draft saved.')}
              className="w-full py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="w-full py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors"
            >
              {isDuplicating ? 'Duplicating...' : 'Duplicate'}
            </button>
            <button
              onClick={handleArchive}
              disabled={isArchiving}
              className="w-full py-2.5 px-4 border border-red-300 dark:border-red-900/50 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-colors"
            >
              {isArchiving ? 'Archiving...' : 'Archive'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
