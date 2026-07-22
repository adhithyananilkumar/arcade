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
  onSelectStep?: (stepIndex: number) => void;
}

export const WorkshopStepper: React.FC<Props> = ({ currentStep, onSelectStep }) => {
  return (
    <div className="w-64 flex-shrink-0">
      <nav aria-label="Progress">
        <ol role="list" className="space-y-6">
          {STEPS.map((step, index) => {
            const isCurrent = currentStep === index;
            const isCompleted = currentStep > index;
            const isLast = index === STEPS.length - 1;

            return (
              <li key={step} className="relative">
                {/* Connecting line between steps */}
                {!isLast && (
                  <div
                    className={`absolute top-8 left-4 -ml-px w-0.5 h-[calc(100%+8px)] ${
                      isCompleted ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    aria-hidden="true"
                  />
                )}

                <div
                  onClick={() => onSelectStep?.(index)}
                  className="relative flex items-center group cursor-pointer transition-colors"
                >
                  <span className="flex items-center">
                    <span
                      className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all ${
                        isCurrent
                          ? 'border-indigo-600 bg-white dark:bg-gray-900 text-indigo-600 shadow-sm'
                          : isCompleted
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:border-indigo-400'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </span>
                  </span>

                  <span className="ml-4 min-w-0 flex flex-col">
                    <span
                      className={`text-sm font-medium transition-colors ${
                        isCurrent
                          ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                          : isCompleted
                          ? 'text-gray-900 dark:text-gray-200'
                          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                      }`}
                    >
                      {step}
                    </span>
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
