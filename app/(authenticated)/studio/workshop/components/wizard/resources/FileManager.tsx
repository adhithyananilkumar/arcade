import React, { useRef, useState } from 'react';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';
import { ResourceType, StorageProvider, WorkshopResource } from '@/app/(authenticated)/studio/workshop/types';

interface Props {
  form: ReturnType<typeof useWorkshopForm>;
  selectedFolderId: string | null;
}

export const FileManager: React.FC<Props> = ({ form, selectedFolderId }) => {
  const { resources = [], folders = [] } = form.formData;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentFolder = folders.find(f => f.id === selectedFolderId);
  const currentResources = selectedFolderId 
    ? resources.filter(r => r.folderId === selectedFolderId)
    : resources.filter(r => !r.folderId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newResources = Array.from(e.target.files).map(file => ({
        id: crypto.randomUUID(),
        title: file.name,
        fileName: file.name,
        originalFileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        resourceType: ResourceType.OTHER, // We'd properly map this in a real upload
        storageProvider: StorageProvider.LOCAL,
        folderId: selectedFolderId || undefined,
        displayOrder: resources.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as WorkshopResource));

      form.handleChange('resources', [...resources, ...newResources]);
    }
  };

  const handleAddExternalLink = () => {
    const url = prompt('Enter External URL:');
    if (!url) return;
    
    const newResource: Partial<WorkshopResource> = {
      id: crypto.randomUUID(),
      title: 'External Resource',
      externalUrl: url,
      resourceType: ResourceType.LINK,
      storageProvider: StorageProvider.EXTERNAL,
      folderId: selectedFolderId || undefined,
      displayOrder: resources.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    form.handleChange('resources', [...resources, newResource]);
  };

  const handleDeleteResource = (id: string) => {
    form.handleChange('resources', resources.filter(r => r.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {currentFolder ? currentFolder.name : 'All Resources'}
          </h2>
          <p className="text-sm text-gray-500">
            {currentResources.length} {currentResources.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleAddExternalLink}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 shadow-sm"
          >
            Add Link
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 shadow-sm"
          >
            Upload Files
          </button>
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            className="hidden" 
          />
        </div>
      </div>

      {/* Upload Area / Empty State */}
      {currentResources.length === 0 ? (
        <div className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No resources yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload PDFs, slides, videos, or add external links.</p>
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400"
            >
              Upload a File
            </button>
          </div>
        </div>
      ) : (
        /* File List */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
          {currentResources.map(resource => (
            <div key={resource.id} className="relative group bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-violet-50 dark:bg-violet-900/30 rounded text-violet-600 dark:text-violet-400 flex-shrink-0">
                  {resource.resourceType === ResourceType.LINK ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {resource.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {resource.resourceType}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleDeleteResource(resource.id!)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
