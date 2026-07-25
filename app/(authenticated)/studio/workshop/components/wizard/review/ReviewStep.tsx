import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';
import { PublishingChecklist } from './PublishingChecklist';
import { WorkshopPreview } from './WorkshopPreview';
import { validateWorkshop, publishWorkshop, unpublishWorkshop, getWorkshopPreview } from '@/app/(authenticated)/studio/workshop/api/publish';
import { PublishValidationResponse, WorkshopPreviewDto } from '@/app/(authenticated)/studio/workshop/types';
import { useRouter } from 'next/navigation';

interface Props {
  form: ReturnType<typeof useWorkshopForm>;
  onNavigateToStep: (step: number) => void;
  onSaveDraft?: (navigateAfterSave?: boolean) => Promise<any>;
  isSaving?: boolean;
}

export const ReviewStep: React.FC<Props> = ({ form, onNavigateToStep, onSaveDraft, isSaving }) => {
  const router = useRouter();
  const [validation, setValidation] = useState<PublishValidationResponse | null>(null);
  const [preview, setPreview] = useState<WorkshopPreviewDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  const workshopId = (form.formData as any).id;
  const isWebinar = form.formData.workshopType === 'WEBINAR';
  const rootTerm = isWebinar ? 'webinar' : 'workshop';
  const RootTerm = isWebinar ? 'Webinar' : 'Workshop';

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
    setIsPublishing(true);
    try {
      let targetId = workshopId;
      if (!targetId && onSaveDraft) {
        targetId = await onSaveDraft(false);
      }

      if (!targetId) {
        toast.error('Please fill in Title and Category first.');
        return;
      }

      await publishWorkshop(targetId);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('arcade_workshop_draft');
      }
      toast.success(`${RootTerm} published successfully!`);
      window.location.reload();
    } catch (e: any) {
      console.error('Publish error:', e);
      toast.error(e?.message || `Failed to publish ${rootTerm}.`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!workshopId) return;
    setIsUnpublishing(true);
    try {
      await unpublishWorkshop(workshopId);
      toast.success(`${RootTerm} unpublished.`);
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message || `Failed to unpublish ${rootTerm}.`);
    } finally {
      setIsUnpublishing(false);
    }
  };

  if (!workshopId) {
    return (
      <div className="p-8 text-center bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-lg max-w-2xl mx-auto space-y-4">
        <p className="text-yellow-800 dark:text-yellow-400 font-semibold text-lg">Save Draft to Review & Publish</p>
        <p className="text-sm text-yellow-700 dark:text-yellow-500">
          You need to save your {rootTerm} draft to the server before reviewing and publishing.
        </p>
        <button
          onClick={() => onSaveDraft?.(false)}
          disabled={isSaving}
          className="inline-flex items-center px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm rounded-lg shadow transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving Draft...' : 'Save Draft Now'}
        </button>
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
          <PublishingChecklist validation={validation} onNavigateToStep={onNavigateToStep} rootTerm={rootTerm} />
        </div>

        {/* Actions */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
            Actions
          </h3>
          <div className="space-y-3">
            {preview?.basicInfo.status === 'PUBLISHED' ? (
              <button
                onClick={handleUnpublish}
                disabled={isUnpublishing}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-sm transition-colors border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-50"
              >
                {isUnpublishing ? 'Unpublishing...' : `Unpublish ${RootTerm}`}
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full py-2.5 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-sm transition-colors bg-violet-600 hover:bg-violet-700 text-white dark:ring-offset-gray-900 cursor-pointer disabled:opacity-50"
              >
                {isPublishing ? 'Publishing...' : `Publish ${RootTerm}`}
              </button>
            )}
            <button
              onClick={() => onSaveDraft?.()}
              disabled={isSaving}
              className="w-full py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-sm transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
