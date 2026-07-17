import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";

interface PublishCourseDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function PublishCourseDialog({ open, onClose, onConfirm }: PublishCourseDialogProps) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Publish Course</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-700 leading-relaxed mb-6">
            You are uploading a Course to Arcade. After publishing, deletion of a course is not permitted.
          </p>
          
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors group-hover:border-indigo-500 flex items-center justify-center">
                <Check size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
              </div>
            </div>
            <span className="text-sm font-medium text-gray-800 select-none">
              Ensure that the course follows arcade content guidelines.
            </span>
          </label>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!checked || loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
