import React from 'react';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';
import { PricingForm } from './PricingForm';
import { PricingSummary } from './PricingSummary';

interface Props {
  form: ReturnType<typeof useWorkshopForm>;
}

export const PricingStep: React.FC<Props> = ({ form }) => {
  return (
    <div className="space-y-6 flex flex-col xl:flex-row xl:space-y-0 xl:space-x-8">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-4xl">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Pricing & Registration</h2>
        <PricingForm form={form} />
      </div>

      <div className="w-full xl:w-80 flex-shrink-0 space-y-6">
        <PricingSummary form={form} />
      </div>
    </div>
  );
};
