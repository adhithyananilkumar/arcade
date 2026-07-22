import React from 'react';

interface Props {
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export const WorkshopStatusBadge: React.FC<Props> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      case 'PUBLISHED':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'ARCHIVED':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStyles()}`}>
      {status}
    </span>
  );
};
