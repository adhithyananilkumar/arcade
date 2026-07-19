'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: string;
}

// Simulated data to mimic fetching Arcade content
const MOCK_CONTENT: ContentItem[] = [
  { id: 'les-1', title: 'Introduction to HTML', type: 'lesson' },
  { id: 'les-2', title: 'CSS Layouts and Flexbox', type: 'lesson' },
  { id: 'les-3', title: 'JavaScript Fundamentals', type: 'lesson' },
  { id: 'les-4', title: 'React Hooks Deep Dive', type: 'lesson' },
  { id: 'quiz-1', title: 'HTML Basics Quiz', type: 'quiz' },
  { id: 'quiz-2', title: 'CSS Selectors Assessment', type: 'quiz' },
  { id: 'assg-1', title: 'Build a Portfolio Page', type: 'assignment' },
  { id: 'res-1', title: 'MDN Web Docs Reference', type: 'resource' },
  { id: 'vid-1', title: 'How the Internet Works', type: 'video' },
];

interface ContentSelectorProps {
  value: string | undefined;
  onChange: (id: string) => void;
  nodeType: string;
}

export function ContentSelector({ value, onChange, nodeType }: ContentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // For the actual value displayed
  const selectedItem = MOCK_CONTENT.find(c => c.id === value) || null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setLoading(true);
    // Simulate network delay
    setTimeout(() => setLoading(false), 300);
  };

  // Filter based on query AND nodeType (if it's a specific type, only show matching or related. For simplicity, just filter by query)
  const filtered = MOCK_CONTENT.filter(c => {
    if (nodeType !== 'section' && c.type !== nodeType && query === '') {
       // if not searching, ideally show relevant types, but let's just show matching types
       // return c.type === nodeType;
    }
    return c.title.toLowerCase().includes(query.toLowerCase());
  }).slice(0, 5);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
        Link Arcade Content
      </label>
      
      <div 
        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white flex justify-between items-center cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <span className={selectedItem ? 'text-gray-900 font-medium truncate' : 'text-gray-400 italic'}>
          {selectedItem ? selectedItem.title : 'Select content...'}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
            <Search size={14} className="text-gray-400" />
            <input 
              autoFocus
              className="bg-transparent border-none outline-none text-sm w-full"
              placeholder={`Search ${nodeType}s...`}
              value={query}
              onChange={handleSearch}
            />
          </div>
          
          <ul className="max-h-48 overflow-y-auto p-1">
            {loading ? (
              <li className="flex items-center justify-center p-4 text-gray-400">
                <Loader2 size={16} className="animate-spin mr-2" />
                <span className="text-xs">Searching...</span>
              </li>
            ) : filtered.length > 0 ? (
              filtered.map(item => (
                <li 
                  key={item.id}
                  className="px-3 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer rounded-md flex flex-col"
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                    setQuery('');
                  }}
                >
                  <span className="font-medium truncate">{item.title}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{item.type}</span>
                </li>
              ))
            ) : (
              <li className="p-3 text-center text-xs text-gray-500">No results found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
