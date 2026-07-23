'use client';

import { useState } from 'react';
import { useReviewWorkspace } from './ReviewWorkspaceProvider';
import { TiptapContentView } from '@/domains/learning/delivery/components/TiptapContentView';
import { SnapshotQuizViewer } from '@/domains/assessments';
import { CourseResponse, LessonResponse, QuizResponse } from '@/shared/types/api.types';
import { GitCompare } from 'lucide-react';

export function ReviewContent() {
  const { workspace, selectedItemId } = useReviewWorkspace();
  const [showDiff, setShowDiff] = useState(false);

  if (!workspace || !workspace.courseVersionSnapshot) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">No content to display</h3>
        <p className="max-w-md text-sm text-gray-500">
          This version has no content in its snapshot. This usually indicates the version snapshot was created before course content was added.
        </p>
      </div>
    );
  }

  let snapshotCourse: CourseResponse;
  let previousSnapshotCourse: CourseResponse | null = null;
  try {
    snapshotCourse = JSON.parse(workspace.courseVersionSnapshot);
    if (workspace.previousCourseVersionSnapshot) {
      previousSnapshotCourse = JSON.parse(workspace.previousCourseVersionSnapshot);
    }
  } catch (e) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Failed to load content.
      </div>
    );
  }

  if (!selectedItemId) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Select a lesson or quiz from the sidebar to view its contents.
      </div>
    );
  }

  // Find the selected item in the snapshot
  let selectedItemType: 'lesson' | 'quiz' | null = null;
  let selectedLesson: LessonResponse | null = null;
  let selectedQuiz: QuizResponse | null = null;

  for (const mod of snapshotCourse.modules) {
    const lesson = mod.lessons?.find(l => l.id === selectedItemId);
    if (lesson) {
      selectedItemType = 'lesson';
      selectedLesson = lesson;
      break;
    }
    const quiz = mod.quizzes?.find(q => q.id === selectedItemId);
    if (quiz) {
      selectedItemType = 'quiz';
      selectedQuiz = quiz;
      break;
    }
  }

  let previousLesson: LessonResponse | null = null;
  if (previousSnapshotCourse && selectedItemType === 'lesson') {
    for (const mod of previousSnapshotCourse.modules) {
      const lesson = mod.lessons?.find(l => l.id === selectedItemId);
      if (lesson) {
        previousLesson = lesson;
        break;
      }
    }
  }

  if (!selectedItemType) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Item not found in this snapshot.
      </div>
    );
  }

  return (
    <div className={`p-8 mx-auto min-h-full bg-white ${showDiff ? 'max-w-[90rem]' : 'max-w-4xl'}`}>
      
      {/* Diff Toggle Bar */}
      {previousSnapshotCourse && selectedItemType === 'lesson' && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowDiff(!showDiff)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showDiff 
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <GitCompare size={16} />
            {showDiff ? 'Exit Diff View' : 'Compare with Previous Version'}
          </button>
        </div>
      )}

      {selectedItemType === 'lesson' && selectedLesson && (
        <div className="space-y-8">
          <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {selectedLesson.title || 'Untitled Lesson'}
            </h1>
          </div>
          
          {showDiff ? (
            <div className="grid grid-cols-2 gap-8 divide-x divide-gray-200">
              {/* Left side: Previous Version */}
              <div className="pr-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Previous Version</h2>
                {previousLesson?.body ? (
                  <TiptapContentView body={previousLesson.body as any} />
                ) : (
                  <p className="text-gray-400 italic">This lesson did not exist in the previous version or was empty.</p>
                )}
              </div>
              
              {/* Right side: Current Version */}
              <div className="pl-4">
                <h2 className="text-sm font-semibold text-indigo-500 uppercase tracking-wider mb-4">Current Submitted Version</h2>
                {selectedLesson.body ? (
                  <TiptapContentView body={selectedLesson.body as any} />
                ) : (
                  <p className="text-gray-500 italic">This lesson is empty.</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              {selectedLesson.body ? (
                <TiptapContentView body={selectedLesson.body as any} />
              ) : (
                <p className="text-gray-500 italic">This lesson is empty.</p>
              )}
            </div>
          )}
        </div>
      )}
      
      {selectedItemType === 'quiz' && selectedQuiz && (
        <div className="space-y-8">
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {selectedQuiz.title || 'Untitled Quiz'}
            </h1>
          </div>
          <SnapshotQuizViewer 
            quiz={selectedQuiz as any}
          />
        </div>
      )}
    </div>
  );
}
