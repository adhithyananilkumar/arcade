'use client';

import { useAuthStore } from '@/store/auth.store';
import { 
  Plus, 
  UserPlus 
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';

import { Button } from '@/components/ui/button';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <motion.div 
      className="space-y-[40px] pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Good Morning, {user.firstName || user.fullName?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Welcome back. Here's what's happening across your organization today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl px-5 h-10 font-medium">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
          <Button className="rounded-xl px-5 h-10 font-medium bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
        </div>
      </motion.div>



    </motion.div>
  );
}
