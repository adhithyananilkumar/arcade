import React from 'react';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';
import { Visibility, ListingStatus, RecordingVisibility, WorkshopSettings } from '@/app/(authenticated)/studio/workshop/types';

interface Props {
  form: ReturnType<typeof useWorkshopForm>;
}

const Toggle = ({ 
  label, 
  description, 
  checked, 
  onChange 
}: { 
  label: string; 
  description?: string; 
  checked: boolean; 
  onChange: (val: boolean) => void;
}) => (
  <div className="flex items-start justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <div className="pr-4">
      <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
    </div>
    <label className="flex items-center cursor-pointer flex-shrink-0 mt-1">
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
      </div>
    </label>
  </div>
);

export const SettingsForm: React.FC<Props> = ({ form }) => {
  const { settings } = form.formData;

  const updateSettings = <K extends keyof WorkshopSettings>(key: K, value: WorkshopSettings[K]) => {
    form.handleChange('settings', {
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="space-y-10">
      
      {/* Visibility Section */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Visibility & Listing</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Visibility</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[Visibility.PUBLIC, Visibility.PRIVATE].map((opt) => (
                <label 
                  key={opt}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    settings.visibility === opt 
                      ? 'bg-violet-50 border-violet-500 dark:bg-violet-900/20 dark:border-violet-500' 
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={opt}
                    checked={settings.visibility === opt}
                    onChange={(e) => updateSettings('visibility', e.target.value as Visibility)}
                    className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                    {opt.charAt(0) + opt.slice(1).toLowerCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Listing Status</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[ListingStatus.LISTED, ListingStatus.FEATURED].map((opt) => (
                <label 
                  key={opt}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    settings.listingStatus === opt 
                      ? 'bg-violet-50 border-violet-500 dark:bg-violet-900/20 dark:border-violet-500' 
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="listingStatus"
                    value={opt}
                    checked={settings.listingStatus === opt}
                    onChange={(e) => updateSettings('listingStatus', e.target.value as ListingStatus)}
                    className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                    {opt === ListingStatus.UNLISTED ? 'Hidden' : opt.charAt(0) + opt.slice(1).toLowerCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* Advanced Settings */}
      <section>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Advanced</h3>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 divide-y divide-gray-100 dark:divide-gray-700 shadow-sm">

          <Toggle 
            label="Auto Publish" 
            description="Automatically transition from Draft to Published on a scheduled date."
            checked={settings.autoPublish || false} 
            onChange={(val) => updateSettings('autoPublish', val)} 
          />
        </div>
      </section>

    </div>
  );
};
