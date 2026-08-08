import React, { useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/shared/design-system/ui/sheet';
import { Button } from '@/shared/design-system/ui/button';
import { useRoadmapViewerStore } from '../store/useRoadmapViewerStore';
import { RoadmapNode } from '../types';
import { CheckCircle, PlayCircle, BookOpen, Clock, FileText, HelpCircle, Laptop } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LearningDrawerProps {
  nodes: RoadmapNode[];
}

export const LearningDrawer: React.FC<LearningDrawerProps> = ({ nodes }) => {
  const { activeNodeId, setActiveNode, progress, toggleNodeCompletion } = useRoadmapViewerStore();
  const router = useRouter();
  
  const activeNode = nodes.find(n => n.id === activeNodeId);
  const isOpen = !!activeNode;

  const nodeProgress = activeNode ? progress[activeNode.id] : null;
  const isCompleted = nodeProgress?.status === 'COMPLETED';

  // Compute dynamic resources based on contentId or node metadata
  const resources = useMemo(() => {
    if (!activeNode) return [];
    const list = [];
    const label = activeNode.label;
    const type = activeNode.type || 'lesson';
    const contentId = activeNode.contentId;

    if (contentId) {
      if (contentId.startsWith('les-')) {
        list.push({ title: `Introduction to ${label}`, type: 'lesson', url: `/learn/demo-course` });
      } else if (contentId.startsWith('quiz-')) {
        list.push({ title: `${label} Quiz`, type: 'quiz', url: `/learn/demo-course` });
      } else if (contentId.startsWith('vid-')) {
        list.push({ title: `Video: Learn ${label}`, type: 'video', url: `https://www.youtube.com` });
      } else if (contentId.startsWith('res-')) {
        list.push({ title: `${label} Documentation`, type: 'doc', url: `https://developer.mozilla.org` });
      } else {
        // UUID mapping to a real Course
        list.push({ title: `Course: ${label}`, type: 'lesson', url: `/learn/${contentId}` });
      }
    } else {
      // Auto-generated resources based on node type
      if (type === 'video') {
        list.push({ title: `🎥 Video Tutorial: ${label} Basics`, type: 'video', url: 'https://www.youtube.com' });
        list.push({ title: `📄 Reference Guide: ${label} Documentation`, type: 'doc', url: 'https://developer.mozilla.org' });
      } else if (type === 'quiz' || type === 'assessment') {
        list.push({ title: `❓ Skill Quiz: Test your ${label} skills`, type: 'quiz', url: '#' });
      } else if (type === 'project') {
        list.push({ title: `💻 Interactive Lab: ${label} Workspace`, type: 'project', url: '#' });
        list.push({ title: `📄 Specs & Instructions: ${label} Requirements`, type: 'doc', url: '#' });
      } else {
        list.push({ title: `📚 Lesson Module: ${label} Fundamentals`, type: 'lesson', url: '#' });
        list.push({ title: `📄 Study Guide: ${label} Overview`, type: 'doc', url: 'https://developer.mozilla.org' });
      }
    }
    return list;
  }, [activeNode]);

  if (!activeNode) return null;

  const handleOpenResource = (res: any) => {
    if (res.url && res.url !== '#') {
      if (res.url.startsWith('http')) {
        window.open(res.url, '_blank');
      } else {
        router.push(res.url);
      }
    } else {
      alert(`Launching learning module: "${res.title}"`);
    }
  };

  const handleStartLearning = () => {
    if (resources.length > 0) {
      handleOpenResource(resources[0]);
    }
  };

  const handleMarkAsComplete = () => {
    toggleNodeCompletion(activeNode.id);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && setActiveNode(null)}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white border-l border-gray-200 shadow-2xl p-6 flex flex-col justify-between">
        <div>
          <SheetHeader className="mb-6">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <span>{activeNode.type || 'Lesson'}</span>
              {activeNode.durationMinutes && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {activeNode.durationMinutes}m
                  </span>
                </>
              )}
            </div>
            <SheetTitle className="text-2xl font-bold text-gray-900 leading-tight">
              {activeNode.label}
            </SheetTitle>
            <SheetDescription className="text-sm text-gray-500 mt-2 leading-relaxed">
              {activeNode.description || "Begin your learning path through this node to master its concepts."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Learning Objectives
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Understand core concepts and foundations of {activeNode.label}.</li>
                <li>Apply key principles in an interactive lab workspace.</li>
                <li>Verify your proficiency with associated quizzes and challenges.</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-indigo-500" />
                Resources
              </h4>
              <div className="space-y-2">
                {resources.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No learning resources available.</p>
                ) : (
                  resources.map((res, index) => (
                    <div 
                      key={index}
                      onClick={() => handleOpenResource(res)}
                      className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between hover:bg-gray-100/80 hover:border-indigo-100 cursor-pointer transition-all duration-200 select-none"
                    >
                      <div className="flex items-center gap-2">
                        {res.type === 'video' ? <PlayCircle className="w-4 h-4 text-red-500" /> : 
                         res.type === 'quiz' ? <HelpCircle className="w-4 h-4 text-amber-500" /> :
                         res.type === 'doc' ? <FileText className="w-4 h-4 text-teal-500" /> :
                         res.type === 'project' ? <Laptop className="w-4 h-4 text-blue-500" /> :
                         <BookOpen className="w-4 h-4 text-indigo-500" />}
                        <span className="text-sm font-semibold text-gray-700">{res.title}</span>
                      </div>
                      <span className="text-xs font-semibold text-indigo-600 hover:underline">Launch →</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl shadow-md transition-all active:scale-95" 
            size="lg"
            disabled={resources.length === 0}
            onClick={handleStartLearning}
          >
            {resources.length === 0 ? 'No learning resources available' : 'Start Learning'}
          </Button>
          <Button 
            variant={isCompleted ? "default" : "outline"} 
            className={`w-full font-bold h-11 rounded-xl active:scale-95 transition-all ${
              isCompleted 
                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-md' 
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            size="lg"
            onClick={handleMarkAsComplete}
          >
            <CheckCircle className={`w-4 h-4 mr-2 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
            {isCompleted ? 'Completed' : 'Mark as Complete'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
