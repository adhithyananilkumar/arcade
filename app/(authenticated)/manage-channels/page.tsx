'use client';

import { motion } from 'framer-motion';
import { MyChannels } from '@/apps/learner/components/channels/MyChannels';

export default function ManageChannelsPage() {
  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 35%, #FFFFFF 70%)',
      }}
    >
      <motion.div
        className="relative z-10 mx-auto w-full max-w-6xl space-y-6 px-5 pb-12 pt-28 sm:px-8 sm:pt-32"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#14142b] md:text-[2rem]">
            Manage Channels
          </h1>
          <p className="mt-1 text-[14px] font-medium text-slate-500">
            Your channels and communities
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_8px_28px_rgba(20,20,43,0.05)] sm:p-6">
          <MyChannels />
        </div>
      </motion.div>
    </div>
  );
}
