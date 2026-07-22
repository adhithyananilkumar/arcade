import React, { useState } from 'react';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';

interface Props {
  form: ReturnType<typeof useWorkshopForm>;
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
}

export const FolderList: React.FC<Props> = ({ form, selectedFolderId, onSelectFolder }) => {
  const { folders = [] } = form.formData;
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder = {
      id: crypto.randomUUID(),
      name: newFolderName,
      displayOrder: folders.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    form.handleChange('folders', [...folders, newFolder]);
    setNewFolderName('');
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white">Folders</h3>
        <button 
          onClick={() => setIsCreating(true)}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
        >
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-2">
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
            selectedFolderId === null 
              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
          <span>All Resources</span>
        </button>

        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => onSelectFolder(folder.id!)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
              selectedFolderId === folder.id 
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
            <span className="truncate">{folder.name}</span>
          </button>
        ))}

        {isCreating && (
          <div className="px-3 py-2">
            <input
              type="text"
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') { setIsCreating(false); setNewFolderName(''); }
              }}
              onBlur={handleCreateFolder}
              placeholder="Folder name..."
              className="w-full text-sm rounded border border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500 px-2 py-1 dark:bg-gray-900 dark:border-indigo-700 dark:text-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};
