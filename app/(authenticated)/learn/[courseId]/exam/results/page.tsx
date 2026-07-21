'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Trophy, ChevronLeft, Award } from 'lucide-react';

export default function ExamResultsPage() {
  const router = useRouter();
  const params = useParams();
  
  const [score, setScore] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const s = sessionStorage.getItem('examScore');
    const t = sessionStorage.getItem('examTotal');
    if (s && t) {
      setScore(parseInt(s, 10));
      setTotal(parseInt(t, 10));
    } else {
      // If no score in session storage, redirect back
      router.push(`/learn/${params.courseId}`);
    }
  }, [router, params.courseId]);

  if (score === null || total === null) {
    return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">Loading...</div>;
  }

  const percentage = (score / total) * 100;
  const isPassed = percentage >= 60;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-12 px-4 flex items-center justify-center font-sans">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center">
        
        <div className={`h-32 ${isPassed ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-rose-400 to-red-500'}`} />
        
        <div className="px-8 pb-12">
          <div className="w-24 h-24 rounded-full bg-white shadow-lg mx-auto -mt-12 flex items-center justify-center border-4 border-white">
            {isPassed ? (
              <Trophy className="w-10 h-10 text-amber-500" />
            ) : (
              <Award className="w-10 h-10 text-slate-400" />
            )}
          </div>

          <h1 className="text-3xl font-black text-slate-900 mt-6">
            {isPassed ? 'Congratulations!' : 'Exam Completed'}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            {isPassed 
              ? 'You have successfully passed the final assessment.' 
              : 'You did not meet the passing criteria. Please review the course material and try again.'}
          </p>

          <div className="mt-10 bg-slate-50 rounded-2xl p-8 border border-slate-100 flex flex-col items-center">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Final Score</div>
            <div className="text-6xl font-black text-slate-900 tracking-tighter">
              {score} <span className="text-3xl text-slate-400 font-medium">/ {total}</span>
            </div>
            <div className="mt-4 px-4 py-1.5 rounded-full bg-white border border-slate-200 font-bold text-slate-600">
              {percentage.toFixed(0)}%
            </div>
          </div>

          <div className="mt-10">
            <button 
              onClick={() => {
                window.location.href = '/';
              }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-95"
            >
              <ChevronLeft size={20} /> Back to Dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
