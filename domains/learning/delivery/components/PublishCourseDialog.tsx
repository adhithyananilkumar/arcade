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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#14142b]/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(20,20,43,0.22)] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-[16px] font-bold tracking-tight text-[#14142b]">
              Approve & publish
            </h2>
            <p className="mt-0.5 text-[12px] font-medium text-slate-500">
              This course will go live on Arcade.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
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
              className="mb-1.5 block text-[12px] font-semibold text-[#14142b]"
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
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-[13px] text-[#14142b] outline-none transition-shadow placeholder:text-slate-400 focus:border-[#14142b]/25 focus:bg-white focus:ring-4 focus:ring-slate-200/70"
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
                    ? "border-[#14142b] bg-[#14142b]"
                    : "border-slate-300 group-hover:border-[#14142b]/60"
                }`}
              >
                <Check
                  size={13}
                  className={`text-white transition-opacity ${checked ? "opacity-100" : "opacity-0"}`}
                  strokeWidth={3}
                />
              </div>
            </div>
            <span className="select-none text-[13px] font-medium text-[#14142b]">
              This course follows Arcade content guidelines.
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full px-4 py-2 text-[12px] font-semibold text-slate-600 transition-colors hover:bg-slate-200/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!checked || loading}
            className="inline-flex items-center gap-2 rounded-full bg-[#14142b] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_8px_16px_rgba(20,20,43,0.16)] transition-colors hover:bg-[#232735] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
