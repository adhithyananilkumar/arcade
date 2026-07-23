'use client';

import { use } from 'react';
import { WorkshopWizard } from '@/app/(authenticated)/studio/workshop/components/wizard/WorkshopWizard';

interface Props {
  params: Promise<{ id: string }>;
}

export default function WorkshopSettingsPage({ params }: Props) {
  const { id } = use(params);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <WorkshopWizard workshopId={id} initialStep={2} />
    </div>
  );
}
