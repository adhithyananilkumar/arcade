import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface PublishCourseDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (note: string) => Promise<void>;
}

export function PublishCourseDialog({ open, onClose, onConfirm }: PublishCourseDialogProps) {
  const [checked, setChecked] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setChecked(false);
      setNote("");
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(note.trim());
      toast.success("Course published");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish the course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 arcade-modal-backdrop" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden arcade-modal-box rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface shadow-[0_24px_60px_rgba(20,20,43,0.22)] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4">
          <div>
            <h2 className="text-base font-bold tracking-tight text-ink">
              Approve & publish
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              This course will go live on Arcade.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink transition-colors cursor-pointer dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <p className="text-[13px] leading-relaxed text-slate-600">
            After publishing, deletion of a course is not permitted. Confirm the content meets
            Arcade guidelines before proceeding.
          </p>

          <div>
            <label
              htmlFor="approval-note"
              className="mb-1.5 block text-[12px] font-semibold text-ink"
            >
              Approval notes{" "}
              <span className="font-medium text-slate-400">(optional)</span>
            </label>
            <textarea
              id="approval-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note for the audit log or author…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-[13px] text-ink outline-none transition-shadow placeholder:text-slate-400 focus:border-ink/25 focus:bg-surface focus:ring-4 focus:ring-slate-200/70"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 group">
            <div className="relative mt-0.5 flex items-center justify-center">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`flex size-5 items-center justify-center rounded border-2 transition-colors ${
                  checked
                    ? "border-ink bg-ink"
                    : "border-slate-300 group-hover:border-ink/60"
                }`}
              >
                <Check
                  size={13}
                  className={`text-white transition-opacity ${checked ? "opacity-100" : "opacity-0"}`}
                  strokeWidth={3}
                />
              </div>
            </div>
            <span className="select-none text-[13px] font-medium text-ink">
              This course follows Arcade content guidelines.
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200/70 bg-slate-50/60 px-6 py-4 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!checked || loading}
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-on-ink shadow-sm transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            {loading ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
