'use client';

import { use } from 'react';
import { EventWizard } from '@/app/(authenticated)/studio/events/components/wizard/EventWizard';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EventPublishPage({ params }: Props) {
  const { id } = use(params);
  return (
    <div className="min-h-screen bg-gray-50">
      <EventWizard eventId={id} initialStep={6} />
    </div>
  );
}
