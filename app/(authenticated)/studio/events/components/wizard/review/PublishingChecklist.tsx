import React from 'react';
import { PublishValidationResponse } from '@/app/(authenticated)/studio/events/types';
import { AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface Props {
  validation: PublishValidationResponse | null;
  onNavigateToStep: (step: number) => void;
  rootTerm?: string;
}

export const PublishingChecklist: React.FC<Props> = ({ validation, onNavigateToStep, rootTerm = 'workshop' }) => {
  if (!validation) return null;

  const sectionMap: Record<string, number> = {
    'Basic Information': 0,
    'Schedule': 1,
    'Resources': 2,
    'Pricing': 3,
    'Settings': 4
  };

  // The server decides what is ready and how complete it is; this renders the answer.
  //
  // It used to discard the server's verdict entirely: issues were filtered down to the two
  // mentioning "title" or "category", everything else was dropped on the floor, and the
  // percentage was overwritten with a literal 100 whenever those two passed. An event with no
  // sessions and no price showed a green "Ready to publish" at 100% and was then refused by the
  // submit gate -- the frontend simulating backend behaviour, and simulating it wrongly.
  const issues = validation.issues || [];
  const isReady = validation.isReady;
  const percentage = validation.completionPercentage;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Publishing Checklist</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isReady 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        }`}>
          {isReady ? 'Ready to Publish' : 'Needs Attention'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-violet-600'}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {issues.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            Issues to Resolve
          </h4>
          <ul className="space-y-3">
            {issues.map((issue, idx) => (
              <li key={idx} className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="block text-xs font-semibold text-yellow-800 dark:text-yellow-500 uppercase tracking-wider mb-1">
                      {issue.section}
                    </span>
                    <p className="text-sm text-yellow-900 dark:text-yellow-200">{issue.issue}</p>
                  </div>
                  <button
                    onClick={() => onNavigateToStep(sectionMap[issue.section] ?? 0)}
                    className="flex items-center text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                  >
                    Fix <ChevronRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isReady && (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-900/50">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">All checks passed! Your {rootTerm} is ready to be published.</p>
          </div>
        </div>
      )}
    </div>
  );
};
