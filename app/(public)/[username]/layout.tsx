'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col flex-1 w-full min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-200/20 to-emerald-200/20 blur-3xl" />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col relative z-10">
        <main className="flex-1 p-6 pt-12 md:p-8 md:pt-16 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
