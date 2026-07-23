'use client';

import { useReviewWorkspace } from './ReviewWorkspaceProvider';
import { Layers, FileText, ListChecks } from 'lucide-react';
import { useState } from 'react';
import { CourseResponse, ModuleResponse, LessonResponse, QuizResponse } from '@/shared/types/api.types';

export function ReviewSidebar() {
  const { workspace, selectedItemId, setSelectedItemId } = useReviewWorkspace();

  if (!workspace || !workspace.courseVersionSnapshot) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No content snapshot available for this review.
      </div>
    );
  }

  let snapshotCourse: CourseResponse;
  try {
    snapshotCourse = JSON.parse(workspace.courseVersionSnapshot);
  } catch (e) {
    return (
      <div className="p-4 text-red-500 text-sm">
        Failed to parse course snapshot.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Content Tree
        </h2>
      </div>
      
      <div className="p-3 space-y-1">
        {snapshotCourse.modules.map((module: ModuleResponse) => (
          <div key={module.id} className="mb-4">
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold text-gray-900">
              <Layers size={16} className="text-gray-400" />
              <span className="truncate">{module.title || 'Untitled Module'}</span>
            </div>
            
            <div className="ml-4 pl-3 border-l border-gray-200 space-y-1 mt-1">
              {module.lessons?.map((lesson: LessonResponse) => (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedItemId(lesson.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-left ${selectedItemId === lesson.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <FileText size={14} className={selectedItemId === lesson.id ? 'text-indigo-500' : 'text-gray-400'} />
                  <span className="truncate">{lesson.title || 'Untitled Lesson'}</span>
                </button>
              ))}
              
              {module.quizzes?.map((quiz: QuizResponse) => (
                <button
                  key={quiz.id}
                  onClick={() => setSelectedItemId(quiz.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-left ${selectedItemId === quiz.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <ListChecks size={14} className={selectedItemId === quiz.id ? 'text-indigo-500' : 'text-gray-400'} />
                  <span className="truncate">{quiz.title || 'Untitled Quiz'}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {snapshotCourse.modules.length === 0 && (
          <div className="text-sm text-gray-500 px-2 italic">This course is empty.</div>
        )}
      </div>
    </div>
  );
}
