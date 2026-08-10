import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useEventForm } from '@/app/(authenticated)/studio/events/hooks/useEventForm';
import { PublishingChecklist } from './PublishingChecklist';
import { EventPreview } from './EventPreview';
import { validateEvent, submitEvent, archiveEvent, duplicateEvent, getEventPreview } from '@/app/(authenticated)/studio/events/api/publish';
import { CourseSubmitDialog } from '@/apps/creator/components/CourseSubmitDialog';
import { PublishValidationResponse, EventPreviewDto } from '@/app/(authenticated)/studio/events/types';
import { useRouter } from 'next/navigation';

interface Props {
  form: ReturnType<typeof useEventForm>;
  onNavigateToStep: (step: number) => void;
  onSaveDraft?: (navigateAfterSave?: boolean) => Promise<any>;
  isSaving?: boolean;
}

export const ReviewStep: React.FC<Props> = ({ form, onNavigateToStep, onSaveDraft, isSaving }) => {
  const router = useRouter();
  const [validation, setValidation] = useState<PublishValidationResponse | null>(null);
  const [preview, setPreview] = useState<EventPreviewDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  // Cast to any to check if an ID exists (i.e. if the draft was saved to backend)
  const eventId = (form.formData as any).id;

  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [valData, previewData] = await Promise.all([
          validateEvent(eventId),
          getEventPreview(eventId)
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
  }, [eventId]);

  const handleOpenSubmit = async () => {
    let targetId = eventId;
    if (!targetId && onSaveDraft) {
      targetId = await onSaveDraft(false);
    }
    if (!targetId) {
      toast.error('Please fill in Title and Category first.');
      return;
    }
    setSubmitDialogOpen(true);
  };

  const handleSubmit = async (data: { message?: string }) => {
    setIsPublishing(true);
    try {
      await submitEvent(eventId, data);
      toast.success('Event submitted for review successfully!');
      router.push('/studio');
    } catch (e: any) {
      console.error('Submit error:', e);
      toast.error(e?.message || 'Failed to submit workshop.');
    } finally {
      setIsPublishing(false);
      setSubmitDialogOpen(false);
    }
  };

  const handleArchive = async () => {
    if (!eventId) return;
    setIsArchiving(true);
    try {
      await archiveEvent(eventId);
      toast.success('Event archived.');
      router.push('/studio');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to archive workshop.');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!eventId) return;
    setIsDuplicating(true);
    try {
      const copy = await duplicateEvent(eventId);
      toast.success('Event duplicated.');
      router.push(`/studio/events/new?id=${copy.id}`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to duplicate workshop.');
    } finally {
      setIsDuplicating(false);
    }
  };

  if (!eventId) {
    return (
      <div className="p-8 text-center bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-lg max-w-2xl mx-auto space-y-4">
        <p className="text-yellow-800 dark:text-yellow-400 font-semibold text-lg">Save Draft to Review & Publish</p>
        <p className="text-sm text-yellow-700 dark:text-yellow-500">
          You need to save your workshop draft to the server before reviewing and publishing.
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
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200">
          <EventPreview data={preview!} showActions={false} />
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
              onClick={handleOpenSubmit}
              disabled={isPublishing}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-sm transition-colors bg-violet-600 hover:bg-violet-700 text-white dark:ring-offset-gray-900 cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? 'Submitting...' : 'Submit for Review'}
            </button>
            <button
              onClick={() => onSaveDraft?.(false)}
              disabled={isSaving}
              className="w-full py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-sm transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="w-full py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-sm transition-colors"
            >
              {isDuplicating ? 'Duplicating...' : 'Duplicate'}
            </button>
            <button
              onClick={handleArchive}
              disabled={isArchiving}
              className="w-full py-2.5 px-4 border border-red-300 dark:border-red-900/50 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm transition-colors"
            >
              {isArchiving ? 'Archiving...' : 'Archive'}
            </button>
          </div>
        </div>
      </div>
      {submitDialogOpen && (
        <CourseSubmitDialog
          contentType="workshop"
          open={submitDialogOpen}
          onClose={() => setSubmitDialogOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
