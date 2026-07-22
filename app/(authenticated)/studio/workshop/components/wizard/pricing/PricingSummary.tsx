import React from 'react';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';
import { PricingModel, RegistrationType, SeatType } from '@/app/(authenticated)/studio/workshop/types';

interface Props {
  form: ReturnType<typeof useWorkshopForm>;
}

export const PricingSummary: React.FC<Props> = ({ form }) => {
  const { pricing } = form.formData;

  if (!pricing) return null;

  const isFree = pricing.pricingModel === PricingModel.FREE;
  const isUnlimited = pricing.seatType === SeatType.UNLIMITED;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount || 0);
  };

  const formatDateRange = (start?: string, end?: string) => {
    if (!start && !end) return 'Not set';
    if (start && !end) return `From ${new Date(start).toLocaleDateString()}`;
    if (!start && end) return `Until ${new Date(end).toLocaleDateString()}`;
    return `${new Date(start!).toLocaleDateString()} → ${new Date(end!).toLocaleDateString()}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Summary</h3>
      
      <div className="space-y-4">
        {/* Pricing Summary */}
        <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Pricing</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isFree ? 'Free' : formatCurrency(pricing.price || 0, pricing.currency || 'USD')}
            </span>
          </div>
          {pricing.pricingModel !== PricingModel.PAID && (
            <div className="flex justify-end">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Model: {pricing.pricingModel?.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Early Bird Summary */}
        {!isFree && pricing.earlyBirdEnabled && (
          <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center">
                Early Bird
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(pricing.earlyBirdPrice || 0, pricing.currency || 'USD')}
              </span>
            </div>
            {pricing.earlyBirdEndDate && (
              <div className="flex justify-end">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Ends {new Date(pricing.earlyBirdEndDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Registration Summary */}
        <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Registration</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {pricing.registrationType?.replace('_', ' ')}
            </span>
          </div>
          <div className="flex justify-between items-start mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Window</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right max-w-[150px]">
              {formatDateRange(pricing.registrationStart, pricing.registrationEnd)}
            </span>
          </div>
        </div>

        {/* Seats Summary */}
        <div className="pt-2">
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Seats</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isUnlimited ? 'Unlimited' : pricing.seatLimit}
            </span>
          </div>
          {!isUnlimited && pricing.waitlistEnabled && (
            <div className="flex justify-end">
              <span className="text-xs text-indigo-600 dark:text-indigo-400">
                Waitlist Enabled
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
