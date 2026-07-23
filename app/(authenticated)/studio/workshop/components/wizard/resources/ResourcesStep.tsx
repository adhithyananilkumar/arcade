import React, { useState } from 'react';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';
import { FileManager } from './FileManager';
import { FolderList } from './FolderList';
import { WorkshopFolder } from '@/app/(authenticated)/studio/workshop/types';

interface Props {
  form: ReturnType<typeof useWorkshopForm>;
}

export const ResourcesStep: React.FC<Props> = ({ form }) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const handleSelectFolder = (folderId: string | null) => {
    setSelectedFolderId(folderId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row min-h-[600px]">
      {/* Sidebar - Folders */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pr-0 md:pr-6 pb-6 md:pb-0 mb-6 md:mb-0">
        <FolderList 
          form={form} 
          selectedFolderId={selectedFolderId} 
          onSelectFolder={handleSelectFolder} 
        />
      </div>

      {/* Main Content - Files & Upload */}
      <div className="flex-1 pl-0 md:pl-6 flex flex-col">
        <FileManager 
          form={form} 
          selectedFolderId={selectedFolderId} 
        />
      </div>
    </div>
  );
};
