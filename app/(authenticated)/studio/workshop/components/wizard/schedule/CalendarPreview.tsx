import React from 'react';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';

interface Props {
  form: ReturnType<typeof useWorkshopForm>;
}

export const CalendarPreview: React.FC<Props> = ({ form }) => {
  const sessions = form.formData.sessions || [];

  if (sessions.length === 0) return null;

  // Sort sessions chronologically for preview
  const sortedSessions = [...sessions].sort((a, b) => {
    if (!a.startDate || !b.startDate) return 0;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Timeline Preview</h3>
      
      <div className="flex flex-col items-start space-y-2 relative pl-4">
        {/* Vertical line connecting timeline */}
        <div className="absolute top-4 bottom-4 left-[23px] w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
        
        {sortedSessions.map((session, index) => (
          <div key={index} className="flex items-center space-x-4 relative z-10 py-2 w-full">
            <div className="w-3 h-3 rounded-full bg-indigo-500 border-4 border-white dark:border-gray-800 box-content flex-shrink-0"></div>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-md border border-gray-100 dark:border-gray-700 flex-1 flex justify-between items-center shadow-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {session.title || `Session ${index + 1}`}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(session.startDate || '')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
