'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/design-system/ui/dialog';
import { Award, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';

export interface PreviewExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  passPercentage: number;
  onSimulate: (percentage: number) => void;
}

export function PreviewExamModal({
  isOpen,
  onClose,
  title,
  passPercentage,
  onSimulate,
}: PreviewExamModalProps) {
  const [score, setScore] = useState<number>(Math.min(100, Math.max(0, passPercentage + 15)));

  const isPassing = score >= passPercentage;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
            <Award size={14} />
            <span>Creator Preview Simulation</span>
          </div>
          <DialogTitle className="text-lg font-bold text-[#14142b]">
            Simulate Student Sitting
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {title} · Passing threshold: {passPercentage}%
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <p className="text-[13px] leading-relaxed text-slate-600">
            In Preview Mode, you can simulate a candidate sitting to preview how your assessment appears
            in both <strong>Passed</strong> and <strong>Not Passed</strong> states. Nothing is written to
            the database.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setScore(Math.min(100, Math.max(passPercentage + 15, 80)))}
              className={`flex-1 rounded-xl border p-2.5 text-center text-xs font-semibold transition-all cursor-pointer ${
                isPassing
                  ? 'border-emerald-300 bg-emerald-50/80 text-emerald-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1 text-emerald-700 font-bold">
                <CheckCircle2 size={15} />
                <span>Simulate Pass</span>
              </div>
              <span className="text-[11px] text-slate-500">Score: {Math.min(100, Math.max(passPercentage + 15, 80))}%</span>
            </button>

            <button
              type="button"
              onClick={() => setScore(Math.max(0, passPercentage - 15))}
              className={`flex-1 rounded-xl border p-2.5 text-center text-xs font-semibold transition-all cursor-pointer ${
                !isPassing
                  ? 'border-rose-300 bg-rose-50/80 text-rose-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1 text-rose-700 font-bold">
                <XCircle size={15} />
                <span>Simulate Fail</span>
              </div>
              <span className="text-[11px] text-slate-500">Score: {Math.max(0, passPercentage - 15)}%</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Adjust Score</span>
              <span className="text-[14px] font-bold tabular-nums text-[#14142b]">{score}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full accent-[#14142b] cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-400">
              <span>0%</span>
              <span className="text-amber-700 font-semibold">Pass: {passPercentage}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSimulate(score)}
            className="rounded-full bg-[#14142b] px-5 py-2 text-xs font-semibold text-white hover:bg-[#232735] transition-colors cursor-pointer"
          >
            Submit Preview Sitting ({score}%)
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
