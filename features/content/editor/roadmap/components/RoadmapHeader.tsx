import React from "react";
import { CheckCircle2, Clock, Eye, FileEdit, Archive, ShieldAlert } from "lucide-react";
import type { RoadmapData } from "../types";

interface RoadmapHeaderProps {
  roadmap: RoadmapData;
  saveState: 'saved' | 'saving' | 'unsaved' | 'error' | 'conflict';
  onPublishClick: () => void;
  onStatusChange: (status: RoadmapData['status']) => void;
  onClose?: () => void;
  onManualSave: () => void;
}

export function RoadmapHeader({ 
  roadmap, 
  saveState,
  onPublishClick, 
  onStatusChange, 
  onClose,
  onManualSave
}: RoadmapHeaderProps) {

  const getStatusBadge = () => {
    switch (roadmap.status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="mr-1" /> Published
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Eye size={12} className="mr-1" /> In Review
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <Archive size={12} className="mr-1" /> Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <FileEdit size={12} className="mr-1" /> Draft
          </span>
        );
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close Studio"
          >
            {/* Using a simple back arrow SVG here to avoid importing ArrowLeft again if not needed, but we can just use standard lucide */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </button>
        )}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{roadmap.title}</h3>
            {getStatusBadge()}
          </div>
          {roadmap.description && (
            <p className="text-sm text-gray-500 leading-tight">{roadmap.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end text-xs text-gray-500 gap-1">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {saveState === 'saving' ? 'Saving...' : saveState === 'unsaved' ? 'Unsaved changes' : `Last Saved: ${new Date(roadmap.updatedAt).toLocaleTimeString()}`}
          </span>
          {roadmap.publishedAt && (
            <span className="text-emerald-600 font-medium">
              Published: {new Date(roadmap.publishedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
          {roadmap.status === 'draft' && (
            <>
              <button 
                onClick={() => onStatusChange('review')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Request Review
              </button>
              <button 
                onClick={onPublishClick}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
              >
                Publish Roadmap
              </button>
            </>
          )}

          {roadmap.status === 'review' && (
            <>
              <button 
                onClick={() => onStatusChange('draft')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Draft
              </button>
              <button 
                onClick={onPublishClick}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
              >
                Publish Roadmap
              </button>
            </>
          )}

          {roadmap.status === 'published' && (
            <>
              <button 
                onClick={() => onStatusChange('archived')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Archive
              </button>
              <button 
                onClick={() => onStatusChange('draft')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Unpublish to Draft
              </button>
            </>
          )}

          {roadmap.status === 'archived' && (
            <button 
              onClick={() => onStatusChange('draft')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Restore to Draft
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
