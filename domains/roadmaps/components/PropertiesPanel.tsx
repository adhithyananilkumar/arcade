import React, { useState, useEffect } from 'react';
import { X, Palette, Settings, Layout, GraduationCap, MessageSquare } from 'lucide-react';
import { Node } from '@xyflow/react';
import { ContentSelector } from './ContentSelector';
import { collaborationService } from '../services/collaboration';
import { CommentData } from '../types';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
  roadmapId?: string;
  readOnly?: boolean;
}

const COLORS = [
  { label: 'Default', value: 'bg-white' },
  { label: 'Indigo', value: 'bg-indigo-600' },
  { label: 'Rose', value: 'bg-rose-500' },
  { label: 'Amber', value: 'bg-amber-500' },
  { label: 'Emerald', value: 'bg-emerald-500' },
  { label: 'Sky', value: 'bg-sky-500' },
  { label: 'Slate', value: 'bg-slate-800' },
];

const TEXT_COLORS = [
  { label: 'Dark (Default)', value: 'text-gray-900', colorCode: '#111827' },
  { label: 'White', value: 'text-white', colorCode: '#ffffff' },
  { label: 'Indigo', value: 'text-indigo-600', colorCode: '#4f46e5' },
  { label: 'Rose', value: 'text-rose-600', colorCode: '#e11d48' },
  { label: 'Emerald', value: 'text-emerald-600', colorCode: '#059669' },
];

const FONTS = [
  { label: 'Sans (Default)', value: 'font-sans' },
  { label: 'Serif', value: 'font-serif' },
  { label: 'Mono', value: 'font-mono' },
];

const NODE_TYPES = [
  { label: 'Lesson', value: 'lesson' },
  { label: 'Quiz', value: 'quiz' },
  { label: 'Assignment', value: 'assignment' },
  { label: 'Resource', value: 'resource' },
  { label: 'Video', value: 'video' },
  { label: 'Section', value: 'section' },
];

const STATUSES = [
  { label: 'Draft', value: 'draft' },
  { label: 'Review', value: 'review' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

export function PropertiesPanel({ selectedNode, onClose, onUpdate, roadmapId, readOnly }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'comments'>('general');
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (roadmapId && selectedNode) {
      collaborationService.getComments(roadmapId, selectedNode.id).then(setComments).catch(console.error);
    }
  }, [roadmapId, selectedNode]);

  if (!selectedNode) return null;

  const data = selectedNode.data;

  const handleChange = (field: string, value: string) => {
    onUpdate(selectedNode.id, { [field]: value });
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !roadmapId) return;
    try {
      await collaborationService.addComment(roadmapId, newComment, selectedNode.id);
      setNewComment("");
      const updated = await collaborationService.getComments(roadmapId, selectedNode.id);
      setComments(updated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-[320px] bg-white border-l border-gray-200 shadow-sm flex flex-col h-full z-10 shrink-0">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm">Node Properties</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex border-b border-gray-100 px-2 pt-2">
        <button 
          onClick={() => setActiveTab('general')}
          className={`flex-1 pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'general' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center justify-center gap-1.5"><Settings size={14} /> General</div>
        </button>
        <button 
          onClick={() => setActiveTab('appearance')}
          className={`flex-1 pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'appearance' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center justify-center gap-1.5"><Palette size={14} /> Style</div>
        </button>
      </div>
      
      <div className="p-5 space-y-6 overflow-y-auto flex-1">
        {activeTab === 'general' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-200">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Title
              </label>
              {readOnly ? (
                <div className="text-sm px-3 py-2 bg-gray-50 rounded-lg text-gray-800">{data.label as string || 'Untitled'}</div>
              ) : (
                <input
                  type="text"
                  value={(data.label as string) || ''}
                  onChange={(e) => handleChange('label', e.target.value)}
                  placeholder="Enter node title"
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Description
              </label>
              {readOnly ? (
                <div className="text-sm px-3 py-2 bg-gray-50 rounded-lg text-gray-800 whitespace-pre-wrap min-h-[4rem]">{data.description as string || 'No description provided.'}</div>
              ) : (
                <div className="relative">
                  <textarea
                    rows={4}
                    value={(data.description as string) || ''}
                    onChange={(e) => {
                      const text = e.target.value;
                      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
                      const currentText = (data.description as string) || '';
                      if (wordCount <= 30 || text.length < currentText.length) {
                        handleChange('description', text);
                      }
                    }}
                    placeholder="Brief description or learning objective..."
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-shadow"
                  />
                  <div className="text-[10px] text-gray-400 mt-1 text-right">
                    {((data.description as string) || '').trim() ? ((data.description as string).trim().split(/\s+/).length) : 0} / 30 words
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Duration
                </label>
                {readOnly ? (
                  <div className="text-sm px-3 py-2 bg-gray-50 rounded-lg text-gray-800">{data.duration as string || 'N/A'}</div>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. 15 min"
                    value={(data.duration as string) || ''}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Difficulty
                </label>
                {readOnly ? (
                  <div className="text-sm px-3 py-2 bg-gray-50 rounded-lg text-gray-800">{data.difficulty as string || 'N/A'}</div>
                ) : (
                  <select
                    value={(data.difficulty as string) || ''}
                    onChange={(e) => handleChange('difficulty', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">None</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <ContentSelector 
                value={(data.contentId as string) || undefined} 
                onChange={(val) => handleChange('contentId', val)} 
                nodeType={(data.nodeType as string) || 'lesson'}
                readOnly={readOnly}
              />
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-200">
            {readOnly ? (
              <div className="text-sm text-gray-500 p-4 text-center bg-gray-50 rounded-lg border border-gray-100">
                Appearance settings are locked while roadmap is published.
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Node Background Color
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map((c) => {
                      const isActive = (data.color as string) === c.value || (!data.color && c.value === 'bg-white');
                      return (
                        <button
                          key={c.value}
                          onClick={() => handleChange('color', c.value)}
                          title={c.label}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${c.value} ${
                            isActive ? 'border-gray-900 scale-110 shadow-md ring-2 ring-indigo-500/30 ring-offset-1' : 'border-gray-200 hover:scale-105 shadow-sm'
                          }`}
                        />
                      );
                    })}
                    <div className="relative flex items-center justify-center">
                      <input
                        type="color"
                        title="Custom Background Color"
                        value={(data.color as string)?.startsWith('#') ? (data.color as string) : '#ffffff'}
                        onChange={(e) => handleChange('color', e.target.value)}
                        className={`w-10 h-10 p-0 border-0 rounded-full cursor-pointer overflow-hidden transition-all shadow-sm bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full ${
                          (data.color as string)?.startsWith('#') ? 'ring-2 ring-gray-900 ring-offset-1 scale-110 shadow-md' : 'hover:scale-105'
                        }`}
                      />
                      {!(data.color as string)?.startsWith('#') && (
                        <div className="absolute inset-0 rounded-full pointer-events-none border-2 border-gray-200"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Font Color
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {TEXT_COLORS.map((c) => {
                      const isActive = (data.fontColor as string) === c.value || (!data.fontColor && c.value === 'text-gray-900');
                      return (
                        <button
                          key={c.value}
                          onClick={() => handleChange('fontColor', c.value)}
                          title={c.label}
                          style={{ backgroundColor: c.colorCode }}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            isActive ? 'border-indigo-500 scale-110 shadow-md ring-2 ring-indigo-500/30 ring-offset-1' : 'border-gray-200 hover:scale-105 shadow-sm'
                          }`}
                        />
                      );
                    })}
                    <div className="relative flex items-center justify-center">
                      <input
                        type="color"
                        title="Custom Font Color"
                        value={(data.fontColor as string)?.startsWith('#') ? (data.fontColor as string) : '#000000'}
                        onChange={(e) => handleChange('fontColor', e.target.value)}
                        className={`w-8 h-8 p-0 border-0 rounded-full cursor-pointer overflow-hidden transition-all shadow-sm bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full ${
                          (data.fontColor as string)?.startsWith('#') ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110 shadow-md' : 'hover:scale-105'
                        }`}
                      />
                      {!(data.fontColor as string)?.startsWith('#') && (
                        <div className="absolute inset-0 rounded-full pointer-events-none border-2 border-gray-200"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Font Family
                  </label>
                  <select
                    value={(data.fontFamily as string) || 'font-sans'}
                    onChange={(e) => handleChange('fontFamily', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
