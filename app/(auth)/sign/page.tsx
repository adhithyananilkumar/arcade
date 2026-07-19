import { AuthOrchestrator } from "@/apps/public/orchestrators/AuthOrchestrator";
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default async function SignPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const initialMode = mode === 'signup' ? 'signup' : 'login';

  return (
    <div className="flex min-h-screen bg-white w-full overflow-hidden">
      
      {/* Left Column: Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 md:p-8 lg:p-12 relative z-20 bg-white h-screen overflow-hidden xl:pr-10">
        <Link href="/" className="absolute top-8 left-8 sm:top-10 sm:left-12 z-50 transition-transform hover:scale-105">
          <Image
            src="/arcade.svg"
            alt="Arcade"
            width={90}
            height={26}
            className="h-7 w-auto"
          />
        </Link>
        <div className="w-full max-w-[440px] relative z-10">
          <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
            <AuthOrchestrator initialMode={initialMode} />
          </Suspense>
        </div>
      </div>

      {/* Right Column: Background Animation matched to Onboarding */}
      <div className="hidden lg:block lg:w-[55%] relative h-screen bg-[#F7F9FB]">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')" }}
          />
        </div>
        
        {/* Wavy SVG overlay matched to onboarding's sweeping double curve */}
        <div className="absolute top-0 -left-1 h-full w-[35%] text-white z-10 pointer-events-none">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" style={{ filter: 'drop-shadow(15px 0px 15px rgba(0,0,0,0.04))' }}>
            {/* The solid white wave */}
            <path 
              d="M0,0 L70,0 C70,18 10,20 10,40 C10,60 60,55 60,75 C60,90 0,90 0,100 L0,100 Z" 
              fill="white" 
            />
            {/* The dotted offset line */}
            <path 
              d="M70,0 C70,18 10,20 10,40 C10,60 60,55 60,75 C60,90 0,90 0,100" 
              fill="none" 
              stroke="#A5B3CA" 
              strokeWidth="0.3" 
              strokeDasharray="1,1" 
              transform="translate(-2, 0)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
