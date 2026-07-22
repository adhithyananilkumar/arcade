import React from 'react';

const STEPS = [
  'Basic Information',
  'Schedule',
  'Pricing',
  'Resources',
  'Settings',
  'Review',
];

interface Props {
  currentStep: number;
}

export const WorkshopStepper: React.FC<Props> = ({ currentStep }) => {
  return (
    <div className="w-64 flex-shrink-0">
      <nav aria-label="Progress">
        <ol role="list" className="overflow-hidden">
          {STEPS.map((step, index) => {
            const isCurrent = currentStep === index;
            const isCompleted = currentStep > index;
            const isDisabled = index > 0; // Only step 0 is active for Phase 1
            
            return (
              <li key={step} className="relative pb-10">
                {index !== STEPS.length - 1 ? (
                  <div className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${isCompleted ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} aria-hidden="true" />
                ) : null}
                
                <div className={`relative flex items-center group ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <span className="h-9 flex items-center">
                    <span className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full border-2 
                      ${isCurrent ? 'border-indigo-600 bg-white dark:bg-gray-900' : 
                        isCompleted ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}
                    `}>
                      {isCompleted ? (
                        <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className={`text-sm font-medium ${isCurrent ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'}`}>
                          {index + 1}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className={`ml-4 min-w-0 flex flex-col ${isCurrent ? 'text-indigo-600 font-semibold' : 'text-gray-500 font-medium dark:text-gray-400'}`}>
                    <span className="text-sm tracking-wide">{step}</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
