import React from 'react';
import { WorkshopStatusBadge } from '@/app/(authenticated)/studio/workshop/components/badges/WorkshopStatusBadge';

interface WorkshopHeaderProps {
  title?: string;
  status?: string;
}

export const WorkshopHeader: React.FC<WorkshopHeaderProps> = ({ title = "Create Workshop", status = "DRAFT" }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
      <WorkshopStatusBadge status={status as any} />
    </div>
  );
};
