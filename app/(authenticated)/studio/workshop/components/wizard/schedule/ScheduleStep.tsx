import React from 'react';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';
import { SessionBuilder } from './SessionBuilder';
import { CalendarPreview } from './CalendarPreview';

interface Props {
  form: ReturnType<typeof useWorkshopForm>;
}

export const ScheduleStep: React.FC<Props> = ({ form }) => {
  const sessions = form.formData.sessions || [];

  const getSummary = () => {
    if (sessions.length === 0) return null;

    const validStartDates = sessions.map(s => s.startDate).filter(Boolean).sort();
    const validEndDates = sessions.map(s => s.endDate).filter(Boolean).sort();
    
    return {
      totalSessions: sessions.length,
      startDate: validStartDates.length > 0 ? new Date(validStartDates[0] as string).toLocaleDateString() : 'TBD',
      endDate: validEndDates.length > 0 ? new Date(validEndDates[validEndDates.length - 1] as string).toLocaleDateString() : 'TBD',
    };
  };

  const summary = getSummary();

  return (
    <div className="space-y-6 flex flex-col xl:flex-row xl:space-y-0 xl:space-x-8">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Workshop Schedule</h2>
          <button
            type="button"
            onClick={() => {
              const newSession = {
                title: `Session ${form.formData.sessions?.length ? form.formData.sessions.length + 1 : 1}`,
                startDate: '',
                endDate: '',
                startTime: '',
                endTime: '',
                timezone: 'UTC',
                deliveryMode: form.formData.deliveryMode || 'ONLINE',
              };
              form.handleChange('sessions', [...(form.formData.sessions || []), newSession]);
            }}
            className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
          >
            + Add Session
          </button>
        </div>
        
        <SessionBuilder form={form} />
      </div>

      <div className="w-full xl:w-80 flex-shrink-0 space-y-6">
        {summary && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Total Sessions</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{summary.totalSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Start Date</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{summary.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">End Date</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{summary.endDate}</span>
              </div>
            </div>
          </div>
        )}

        <CalendarPreview form={form} />
      </div>
    </div>
  );
};
