'use client';

import React from "react";
import { CheckCircle2, Clock, Eye, FileEdit, Archive, ShieldAlert } from "lucide-react";
import { Button } from "@/shared/design-system/ui/button";
import { Badge } from "@/shared/design-system/ui/badge";
import type { RoadmapData } from "../types";

interface RoadmapHeaderProps {
  roadmap: RoadmapData;
  saveState: 'saved' | 'saving' | 'unsaved' | 'error' | 'conflict';
  onPublishClick: () => void;
  onStatusChange: (status: RoadmapData['status']) => void;
  onClose?: () => void;
  onManualSave: () => void;
  onSaveAsTemplateClick: () => void;
  onExportClick: () => void;
  onImportClick: () => void;
}

export function RoadmapHeader({ 
  roadmap, 
  saveState,
  onPublishClick, 
  onStatusChange, 
  onClose,
  onManualSave,
  onSaveAsTemplateClick,
  onExportClick,
  onImportClick
}: RoadmapHeaderProps) {

  const getStatusBadge = () => {
    switch (roadmap.status) {
      case 'published':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 size={12} className="mr-1" /> Published
          </Badge>
        );
      case 'review':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Eye size={12} className="mr-1" /> In Review
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
            <Archive size={12} className="mr-1" /> Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
            <FileEdit size={12} className="mr-1" /> Draft
          </Badge>
        );
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {onClose && (
          <Button 
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="-ml-2 text-gray-400 hover:text-gray-600"
            title="Close Studio"
          >
            {/* Using a simple back arrow SVG here to avoid importing ArrowLeft again if not needed, but we can just use standard lucide */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </Button>
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
          <Button 
            variant="outline"
            size="sm"
            onClick={onImportClick}
            title="Import from JSON"
          >
            Import
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={onExportClick}
            title="Export to JSON"
          >
            Export
          </Button>
          <Button 
            variant="secondary"
            size="sm"
            onClick={onSaveAsTemplateClick}
            className="mr-2 text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100"
          >
            Save as Template
          </Button>

          {roadmap.status === 'draft' && (
            <>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onStatusChange('review')}
              >
                Request Review
              </Button>
              <Button 
                size="sm"
                onClick={onPublishClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Publish Roadmap
              </Button>
            </>
          )}

          {roadmap.status === 'review' && (
            <>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onStatusChange('draft')}
              >
                Back to Draft
              </Button>
              <Button 
                size="sm"
                onClick={onPublishClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Publish Roadmap
              </Button>
            </>
          )}

          {roadmap.status === 'published' && (
            <>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onStatusChange('archived')}
              >
                Archive
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onStatusChange('draft')}
              >
                Unpublish to Draft
              </Button>
            </>
          )}

          {roadmap.status === 'archived' && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onStatusChange('draft')}
            >
              Restore to Draft
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
