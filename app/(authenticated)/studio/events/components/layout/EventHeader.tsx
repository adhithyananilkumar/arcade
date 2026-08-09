import React from 'react';
import { EventStatusBadge } from '@/app/(authenticated)/studio/events/components/badges/EventStatusBadge';

interface EventHeaderProps {
  title?: string;
  status?: string;
}

export const EventHeader: React.FC<EventHeaderProps> = ({ title = "Create Event", status = "DRAFT" }) => {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
      <EventStatusBadge status={status as any} />
    </div>
  );
};
