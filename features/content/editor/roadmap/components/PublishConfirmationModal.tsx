import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface PublishConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nodeCount: number;
  edgeCount: number;
  validationErrors: string[];
  hasUnsavedChanges: boolean;
}

export function PublishConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  nodeCount,
  edgeCount,
  validationErrors,
  hasUnsavedChanges
}: PublishConfirmationModalProps) {
  if (!isOpen) return null;

  const isValid = validationErrors.length === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Publish Roadmap</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-lg p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${isValid ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {isValid ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div>
              <h3 className={`text-base font-semibold ${isValid ? 'text-gray-900' : 'text-red-700'}`}>
                {isValid ? 'Ready to Publish' : 'Validation Failed'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isValid 
                  ? 'Your roadmap has passed all validation checks and is ready to be published.'
                  : 'Please resolve the following issues before publishing.'}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Summary</h4>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Learning Nodes</span>
              <span className="font-medium text-gray-900">{nodeCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Connections</span>
              <span className="font-medium text-gray-900">{edgeCount}</span>
            </div>
          </div>

          {!isValid && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <h4 className="text-sm font-semibold text-red-800 mb-2">Errors</h4>
              <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {hasUnsavedChanges && isValid && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 flex items-start gap-3 text-amber-800">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong>Unsaved Changes:</strong> You have unsaved changes. Publishing will automatically save them first.
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            disabled={!isValid}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-colors ${
              isValid ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-400 cursor-not-allowed opacity-50'
            }`}
          >
            {hasUnsavedChanges ? 'Save & Publish' : 'Publish Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
