import React from 'react';

interface Props {
  onBack?: () => void;
  onSaveDraft?: () => void;
  onContinue?: () => void;
  canContinue: boolean;
  isSaving?: boolean;
}

export const WorkshopFooter: React.FC<Props> = ({ 
  onBack, 
  onSaveDraft, 
  onContinue, 
  canContinue,
  isSaving = false 
}) => {
  return (
    <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
      <button
        type="button"
        onClick={onBack}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Back
      </button>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue || isSaving}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
