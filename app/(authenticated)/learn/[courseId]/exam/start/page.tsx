'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/infrastructure/http/api';

type Question = {
  id: number;
  level: string;
  question: string;
  options: string[];
  correctAnswer: number;
};

export default function ExamEnginePage() {
  const router = useRouter();
  const params = useParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 1 hour in seconds
  const [strikes, setStrikes] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load questions
  useEffect(() => {
    api.get<Question[]>(`/api/courses/${params.courseId}/exam/questions`)
      .then(data => {
        setQuestions(data);
      })
      .catch(err => {
        console.error("Failed to load questions", err);
      });
  }, [params.courseId]);

  // Check if already terminated
  useEffect(() => {
    if (sessionStorage.getItem(`exam_terminated_${params.courseId}`)) {
      router.replace(`/learn/${params.courseId}/exam/terminated`);
    }
  }, [params.courseId, router]);

  // Handle anti-cheat strikes side effects safely
  useEffect(() => {
    if (strikes >= 3) {
      sessionStorage.setItem(`exam_terminated_${params.courseId}`, 'true');
      router.replace(`/learn/${params.courseId}/exam/terminated`);
    } else if (strikes > 0) {
      setShowWarning(true);
    }
  }, [strikes, params.courseId, router]);

  // Anti-Cheat Engine
  useEffect(() => {
    // Attempt fullscreen on mount (fallback)
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        // Ignored
      }
    };
    enterFullscreen();

    const handleStrike = (reason: string) => {
      if (isSubmitting) return;
      console.warn("Anti-Cheat Strike:", reason);
      setStrikes(prev => prev + 1);
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleStrike("Exited Fullscreen");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleStrike("Switched Tabs or Minimized");
      }
    };

    const handleBlur = () => {
      handleStrike("Window Lost Focus");
    };

    const handlePreventDefault = (e: Event) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['U', 'u', 'C', 'c', 'V', 'v', 'X', 'x', 'A', 'a'].includes(e.key)) ||
        e.altKey
      ) {
        e.preventDefault();
        handleStrike("Prohibited Keyboard Shortcut");
      }
    };

    const handleResize = () => {
      // DevTools detection via window size discrepancy
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > 200 || heightDiff > 200) {
        handleStrike("Developer Tools Detected");
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    // Attach listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    
    document.addEventListener('contextmenu', handlePreventDefault);
    document.addEventListener('selectstart', handlePreventDefault);
    document.addEventListener('dragstart', handlePreventDefault);
    document.addEventListener('copy', handlePreventDefault);
    document.addEventListener('cut', handlePreventDefault);
    document.addEventListener('paste', handlePreventDefault);
    
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handlePreventDefault);
      document.removeEventListener('selectstart', handlePreventDefault);
      document.removeEventListener('dragstart', handlePreventDefault);
      document.removeEventListener('copy', handlePreventDefault);
      document.removeEventListener('cut', handlePreventDefault);
      document.removeEventListener('paste', handlePreventDefault);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router, params.courseId, isSubmitting]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleReturnToFullscreen = async () => {
    setShowWarning(false);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen failed", err);
    }
  };

  const handleSelectOption = (optIdx: number) => {
    if (!questions[currentIdx]) return;
    const qId = questions[currentIdx].id;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
    
    // Automatically unmark from review if they actually answered it and want to proceed, 
    // but typically we let them keep the flag if they want.
  };

  const toggleReview = () => {
    if (!questions[currentIdx]) return;
    const qId = questions[currentIdx].id;
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // In a real app, save answers to backend. For now, pass via sessionStorage or just calculate.
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });
    
    sessionStorage.setItem('examScore', score.toString());
    sessionStorage.setItem('examTotal', questions.length.toString());
    
    // Exit fullscreen before redirecting
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        router.push(`/learn/${params.courseId}/exam/results`);
      }).catch(() => {
        router.push(`/learn/${params.courseId}/exam/results`);
      });
    } else {
      router.push(`/learn/${params.courseId}/exam/results`);
    }
  };

  if (questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">Loading Exam Environment...</div>;
  }

  const currentQ = questions[currentIdx];
  const isAnswered = answers[currentQ.id] !== undefined;
  const isReviewed = markedForReview.has(currentQ.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100">
      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="text-red-600 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Fullscreen Exited</h2>
              <p className="text-slate-600 mb-6">
                You have exited the fullscreen environment. This is strike {strikes} of 2. If you reach 3 strikes, your exam will be terminated.
              </p>
              <button 
                onClick={handleReturnToFullscreen}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all"
              >
                Return to Exam
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0">
        <div className="font-bold text-lg text-slate-800">Final Assessment</div>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-1.5 rounded-lg ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
          <Clock size={20} />
          {formatTime(timeLeft)}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Question Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-bold tracking-wider text-slate-400 uppercase">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wide">
                {currentQ.level}
              </span>
            </div>

            <h2 className="text-2xl font-semibold text-slate-900 mb-8 leading-snug">
              {currentQ.question}
            </h2>

            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full flex items-center p-5 rounded-2xl border-2 text-left transition-all ${
                    answers[currentQ.id] === idx 
                      ? 'border-indigo-600 bg-indigo-50/50' 
                      : 'border-slate-200 hover:border-indigo-300 bg-white'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center ${
                    answers[currentQ.id] === idx ? 'border-indigo-600' : 'border-slate-300'
                  }`}>
                    {answers[currentQ.id] === idx && <div className="w-3 h-3 bg-indigo-600 rounded-full" />}
                  </div>
                  <span className={`text-lg ${answers[currentQ.id] === idx ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}>
                    {opt}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-8">
              <button 
                onClick={toggleReview}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                  isReviewed 
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Flag size={18} className={isReviewed ? 'fill-amber-700' : ''} />
                {isReviewed ? 'Marked for Review' : 'Mark for Review'}
              </button>

              <div className="flex gap-3">
                <button 
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                
                {currentIdx < questions.length - 1 ? (
                  <button 
                    onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-sm"
                  >
                    Next <ChevronRight size={20} />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all active:scale-95 shadow-sm"
                  >
                    Submit Exam <CheckCircle2 size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Progress Panel */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col hidden lg:flex">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">Exam Progress</h3>
            <div className="flex gap-4 mb-2">
              <div className="flex-1 bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                <div className="text-2xl font-black text-indigo-600">{Object.keys(answers).length}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Answered</div>
              </div>
              <div className="flex-1 bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                <div className="text-2xl font-black text-amber-500">{markedForReview.size}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Review</div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-5 gap-3">
              {questions.map((q, idx) => {
                const hasAnswer = answers[q.id] !== undefined;
                const isRev = markedForReview.has(q.id);
                const isActive = currentIdx === idx;
                
                let bgClass = "bg-white border-slate-200 text-slate-600 hover:border-slate-400";
                if (hasAnswer) bgClass = "bg-indigo-600 border-indigo-600 text-white";
                if (isRev) bgClass = "bg-amber-100 border-amber-400 text-amber-800";
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 rounded-lg border-2 text-sm font-bold flex items-center justify-center transition-all ${bgClass} ${isActive ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <button 
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
            >
              Submit Exam
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
