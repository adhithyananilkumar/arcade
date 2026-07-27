'use client';

import React from 'react';

interface ContentSelectorProps {
  value: string | undefined;
  onChange: (id: string) => void;
  nodeType: string;
  readOnly?: boolean;
}

export function ContentSelector({ value, onChange, nodeType, readOnly }: ContentSelectorProps) {
  if (readOnly) {
    return (
      <div className="relative">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
          Linked Arcade Content
        </label>
        <div className="text-sm px-3 py-2 bg-gray-50 rounded-lg text-gray-800 break-all">
          {value || 'None'}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
        Linked Arcade Content ID
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${nodeType} ID...`}
        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}
