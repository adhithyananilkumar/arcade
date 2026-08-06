'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MyChannels } from '@/apps/learner/components/channels/MyChannels';
import { channelService, Channel } from '@/domains/channels';

export default function ManageChannelsPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    Promise.all([
      channelService.getMyChannels(),
      channelService.getMyWorkspaces(),
    ])
      .then(([owned, workspaces]) => {
        const map = new Map<string, Channel>();
        (owned || []).forEach((c) => map.set(c.id, c));
        (workspaces || []).forEach((w) => map.set(w.id, w));
        const unique = Array.from(map.values());
        if (unique.length === 1) {
          router.replace(`/channels/${unique[0].id}/manage`);
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        setChecking(false);
      });
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 text-xs font-semibold text-slate-400">
        Loading channels…
      </div>
    );
  }

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
