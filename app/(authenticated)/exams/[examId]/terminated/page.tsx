'use client';

import Link from 'next/link';
import { ShieldAlert, ChevronLeft } from 'lucide-react';

export default function ExamTerminatedPage() {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%)' }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-rose-200/80 bg-white text-center shadow-[0_20px_50px_rgba(20,20,43,0.12)]">
        <div className="border-b border-rose-100 bg-rose-50 px-8 py-8">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-rose-600 shadow-sm">
            <ShieldAlert size={28} />
          </div>
          <h1 className="mt-5 text-[1.5rem] font-bold tracking-tight text-[#14142b]">
            Exam terminated
          </h1>
          <p className="mt-2 text-[13px] font-semibold text-rose-700">
            You are no longer allowed to continue this session.
          </p>
        </div>

        <div className="px-8 py-7">
          <p className="text-[13px] font-medium leading-relaxed text-slate-500">
            The session ended after repeated fullscreen anti-cheat violations. Progress from this
            attempt has been voided.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#232735]"
          >
            <ChevronLeft size={16} />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
