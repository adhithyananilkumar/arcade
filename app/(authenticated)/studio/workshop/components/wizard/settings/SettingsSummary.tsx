import React from 'react';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';

interface Props {
  form: ReturnType<typeof useWorkshopForm>;
}

export const SettingsSummary: React.FC<Props> = ({ form }) => {
  const { settings } = form.formData;
  
  if (!settings) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-6">
        Live Summary
      </h3>
      
      <div className="space-y-4">
        {/* Visibility Summary */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Workshop Visibility</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {settings.visibility ? (settings.visibility.charAt(0) + settings.visibility.slice(1).toLowerCase()) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-start mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Listing Status</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
              {settings.listingStatus === 'UNLISTED' ? 'Hidden' : (settings.listingStatus ? (settings.listingStatus.charAt(0) + settings.listingStatus.slice(1).toLowerCase()) : 'N/A')}
            </span>
          </div>
        </div>

        {/* Experience Summary */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Reviews</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {settings.allowReviews ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between items-start mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Certificates</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {settings.certificateEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between items-start mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Recording</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {settings.recordingAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>

        {/* Notification Summary */}
        <div className="pt-2">
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-500 dark:text-gray-400">Notifications</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
              {settings.emailNotifications && settings.mobileNotifications ? 'Email + Push' : 
               settings.emailNotifications ? 'Email Only' : 
               settings.mobileNotifications ? 'Push Only' : 'Disabled'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
