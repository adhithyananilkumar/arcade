import React from 'react';
import { useEventForm } from '@/app/(authenticated)/studio/events/hooks/useEventForm';
import { SettingsForm } from './SettingsForm';
import { SettingsSummary } from './SettingsSummary';

interface Props {
  form: ReturnType<typeof useEventForm>;
}

export const SettingsStep: React.FC<Props> = ({ form }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Form Area */}
      <div className="flex-1 lg:max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <SettingsForm form={form} />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
        <SettingsSummary form={form} />
      </div>
    </div>
  );
};
