'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { ChevronRight, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ExamAcknowledgementPage() {
  const router = useRouter();
  const params = useParams();
  const [agreed, setAgreed] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(`exam_terminated_${params.courseId}`)) {
      setIsTerminated(true);
    }
  }, [params.courseId]);

  const canStart = agreed && !isTerminated;

  const handleStartExam = async () => {
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Failed to enter fullscreen", err);
    }
    router.push(`/learn/${params.courseId}/exam/start`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 mb-4">
            <ShieldCheck size={16} /> Secure Exam Environment
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Exam Acknowledgement
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Please read the rules carefully and verify your identity before proceeding.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Rules */}
          <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="text-amber-500" /> Exam Conditions
              </h2>
            </div>
            
            <div className="p-8 prose prose-slate max-w-none space-y-4">
              <h3 className="text-lg font-semibold">1. Fullscreen Requirement</h3>
              <p className="text-slate-600">This exam must be taken in a fullscreen environment. When you click start, your browser will automatically enter fullscreen mode.</p>
              
              <h3 className="text-lg font-semibold mt-6">2. Anti-Cheat Monitoring</h3>
              <p className="text-slate-600">Our system strictly monitors window focus and fullscreen status. If you attempt to exit fullscreen (e.g., by pressing Escape), the system will register a strike.</p>
              
              <h3 className="text-lg font-semibold mt-6">3. Three Strikes Rule</h3>
              <p className="text-slate-600">You are allowed a maximum of 2 warnings. If you violate the fullscreen policy for a 3rd time, your exam will be immediately terminated and marked as failed.</p>

              <h3 className="text-lg font-semibold mt-6">4. Time Limit</h3>
              <p className="text-slate-600">You have exactly 60 minutes to complete 25 questions. The timer begins immediately when you start the exam. If time runs out, your current progress will be auto-submitted.</p>

              <h3 className="text-lg font-semibold mt-6">5. Question Navigation</h3>
              <p className="text-slate-600">You may mark questions for review and navigate between them using the right-side panel. Ensure all questions are answered before final submission.</p>
              
            </div>

            {isTerminated && (
              <div className="mx-6 mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
                <AlertTriangle size={20} />
                <span className="font-medium">You cannot take this exam because your previous session was terminated due to anti-cheat violations.</span>
              </div>
            )}

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  checked={agreed}
                  onChange={() => setAgreed(true)}
                  className="mt-1 h-5 w-5 text-indigo-600 border-slate-300 focus:ring-indigo-600"
                />
                <span className="text-sm font-medium text-slate-700 max-w-lg">
                  I confirm that I have read and agree to the above conditions. I understand that violating these rules will result in immediate termination.
                </span>
              </label>

              <button
                disabled={!canStart}
                onClick={handleStartExam}
                className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all whitespace-nowrap ${
                  canStart 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-95' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Start Exam <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
