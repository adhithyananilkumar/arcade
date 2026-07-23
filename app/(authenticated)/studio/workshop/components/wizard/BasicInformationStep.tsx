import React from 'react';
import { CATEGORIES, DELIVERY_MODES, DIFFICULTIES, LANGUAGES, WORKSHOP_TYPES } from '@/app/(authenticated)/studio/workshop/constants';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';

interface Props {
  form: ReturnType<typeof useWorkshopForm>;
}

const InputWrapper = ({ label, name, error, children, required = false, className = '' }: any) => (
  <div className={`mb-6 ${className}`}>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>
);

export const BasicInformationStep: React.FC<Props> = ({ form }) => {
  const { formData, errors, handleChange } = form;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-4xl">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">Basic Information</h2>
      
      {/* Title spans full width to emphasize it */}
      <InputWrapper label="Workshop Title" name="title" error={errors.title} required className="w-full">
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-base focus:outline-none focus:ring-2 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300 dark:text-white transition-shadow"
          placeholder="e.g. Advanced React Patterns"
        />
      </InputWrapper>

      {/* Grid for standard inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-4">
        
        <InputWrapper label="Category" name="category" error={errors.category} required>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300 dark:text-white"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </InputWrapper>

        <InputWrapper label="Type" name="workshopType" error={errors.workshopType} required>
          <select
            id="workshopType"
            value={formData.workshopType}
            onChange={(e) => handleChange('workshopType', e.target.value as any)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300 dark:text-white"
          >
            {WORKSHOP_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </InputWrapper>

        <InputWrapper label="Delivery Mode" name="deliveryMode" error={errors.deliveryMode} required>
          <select
            id="deliveryMode"
            value={formData.deliveryMode}
            onChange={(e) => handleChange('deliveryMode', e.target.value as any)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300 dark:text-white"
          >
            {DELIVERY_MODES.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </InputWrapper>

        <InputWrapper label="Language" name="language" error={errors.language} required>
          <select
            id="language"
            value={formData.language}
            onChange={(e) => handleChange('language', e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300 dark:text-white"
          >
            <option value="">Select language</option>
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </InputWrapper>

        <InputWrapper label="Difficulty (optional)" name="difficulty" error={errors.difficulty}>
          <select
            id="difficulty"
            value={formData.difficulty}
            onChange={(e) => handleChange('difficulty', e.target.value as any)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300 dark:text-white"
          >
            {DIFFICULTIES.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </InputWrapper>

        <InputWrapper label="Tags (optional)" name="tags" error={errors.tags}>
          <input
            type="text"
            id="tags"
            value={formData.tags?.join(', ') || ''}
            onChange={(e) => {
              const tagsArray = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
              handleChange('tags', tagsArray);
            }}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300 dark:text-white"
            placeholder="e.g. react, patterns, advanced"
          />
        </InputWrapper>
      </div>
      
      <div className="mt-6">
        <InputWrapper label="Description (optional)" name="description" error={errors.description} className="w-full">
          <textarea
            id="description"
            rows={8}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-300 dark:text-white resize-y"
            placeholder="Describe what students will learn in this workshop..."
          />
        </InputWrapper>
      </div>
    </div>
  );
};
