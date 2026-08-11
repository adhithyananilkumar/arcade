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
        className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="mb-10">
          <h1 className="font-sentient text-[2.25rem] font-bold tracking-tight text-[#14142b] md:text-[2.75rem]">
            Manage Channels
          </h1>
          <p className="mt-1 text-[14px] font-medium text-slate-500">
            Your personal workspace channel and organization memberships
          </p>
        </div>

        <MyChannels />
      </motion.div>
    </div>
  );
}


