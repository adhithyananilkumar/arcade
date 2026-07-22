import { Metadata } from 'next';
import { WorkshopWizard } from '@/app/(authenticated)/studio/workshop/components/wizard/WorkshopWizard';

export const metadata: Metadata = {
  title: 'Create Workshop | Arcade Studio',
  description: 'Create a new workshop on Arcade',
};

export default function NewWorkshopPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <WorkshopWizard />
    </div>
  );
}
