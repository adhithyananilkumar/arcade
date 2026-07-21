'use client';

import { useRouter, useParams } from 'next/navigation';
import { ShieldAlert, ChevronLeft } from 'lucide-react';

export default function ExamTerminatedPage() {
  const router = useRouter();
  const params = useParams();

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-4 font-sans selection:bg-red-500/30">
      <div className="max-w-xl w-full bg-slate-800 rounded-3xl p-8 md:p-12 text-center border border-slate-700 shadow-2xl relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/20 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="mx-auto w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>

          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
            Exam Terminated
          </h1>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8">
            <p className="text-xl font-medium text-red-400">
              You are not allowed anymore.
            </p>
          </div>

          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-md mx-auto">
            Your exam session was forcefully terminated due to repeated violations of the fullscreen anti-cheat policy. All current progress has been voided.
          </p>

          <button 
            onClick={() => {
              window.location.href = '/';
            }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            <ChevronLeft size={20} /> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
