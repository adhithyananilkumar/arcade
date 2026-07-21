'use client';

import { motion } from 'framer-motion';
import { MyChannels } from '../MyChannels';

export default function ManageChannelsPage() {
  return (
    <motion.div 
      className="max-w-6xl w-full mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Manage Channels</h1>
        <p className="text-gray-500 dark:text-neutral-400 mt-1 transition-colors">View and manage your channels and communities.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black p-4 sm:p-6 shadow-sm transition-colors">
        <MyChannels />
      </div>
    </motion.div>
  );
}
