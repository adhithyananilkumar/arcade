import React, { useMemo, useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/shared/design-system/ui/sheet';
import { Button } from '@/shared/design-system/ui/button';
import { useRoadmapViewerStore } from '../store/useRoadmapViewerStore';
import { RoadmapNode } from '../types';
import { CheckCircle, PlayCircle, BookOpen, Clock, FileText, HelpCircle, Laptop, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface LearningDrawerProps {
  nodes: RoadmapNode[];
}

export const LearningDrawer: React.FC<LearningDrawerProps> = ({ nodes }) => {
  const { activeNodeId, setActiveNode, progress, toggleNodeCompletion } = useRoadmapViewerStore();
  const router = useRouter();

  const activeNode = nodes.find(n => n.id === activeNodeId);
  
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'tutor'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Welcome message when topic changes
  useEffect(() => {
    if (activeNode) {
      setChatMessages([
        {
          sender: 'tutor',
          text: `Hi! 👋 I'm your AI Tutor for **${activeNode.label}**. Ask me any detailed question, or pick a topic below!`
        }
      ]);
    }
  }, [activeNodeId]);

  const suggestions = useMemo(() => {
    if (!activeNode) return [];
    const name = activeNode.label;
    return [
      `Explain ${name} like I am 5 years old`,
      `What are common mistakes with ${name}?`,
      `Give me a code template for ${name}`
    ];
  }, [activeNode]);

  const handleSendSuggested = (sugText: string) => {
    if (isTyping) return;
    sendMessage(sugText);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    const userText = chatInput;
    setChatInput('');
    sendMessage(userText);
  };

  const sendMessage = (text: string) => {
    setChatMessages(prev => [...prev, { sender: 'user', text }]);
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const name = activeNode?.label || 'this topic';

      if (text.includes('5 years old')) {
        reply = `Imagine **${name}** is like the plumbing in your house. 🚰\n\nYou don't see it every day, but it connects everything behind the walls so water flows where it needs to go. Without it, your house wouldn't work!`;
      } else if (text.includes('mistakes')) {
        reply = `Here are common pitfalls when learning **${name}**:\n\n1. **Memorizing syntax**: Focus on understanding *why* a concept works rather than memorizing every property name.\n2. **Skipping practical application**: Always type out code yourself instead of copy-pasting.\n3. **Ignoring browser devtools**: Use the inspector panel to debug properties.`;
      } else if (text.includes('code template') || text.includes('template')) {
        if (name.toLowerCase().includes('html')) {
          reply = `Here is a clean HTML semantic document skeleton:\n\n\`\`\`html\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Landing Page</title>\n</head>\n<body>\n  <header>\n    <h1>Welcome</h1>\n  </header>\n</body>\n</html>\n\`\`\``;
        } else if (name.toLowerCase().includes('css')) {
          reply = `Here is a useful CSS Flexbox layout template:\n\n\`\`\`css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 16px;\n}\n\`\`\``;
        } else {
          reply = `Here is a starting setup for working with **${name}**:\n\n\`\`\`javascript\n// Learning ${name}\nfunction initializeNode() {\n  console.log("${name} initialized!");\n}\ninitializeNode();\n\`\`\``;
        }
      } else {
        reply = `That is a great question! In **${name}**, this concept forms the core foundation. Make sure to check out the official docs in the Resources section above, or ask me for a code example!`;
      }

      setChatMessages(prev => [...prev, { sender: 'tutor', text: reply }]);
      setIsTyping(false);
    }, 1200);
  };

  // Helper to parse double asterisks for bolding and code blocks
  const renderMessageText = (text: string) => {
    if (text.includes('```')) {
      const parts = text.split('```');
      return parts.map((part, i) => {
        if (i % 2 === 1) {
          const firstLineBreak = part.indexOf('\n');
          const lang = firstLineBreak > -1 ? part.substring(0, firstLineBreak).trim() : '';
          const code = firstLineBreak > -1 ? part.substring(firstLineBreak + 1) : part;

          return (
            <div key={i} className="my-2 bg-slate-900 rounded-xl overflow-hidden shadow-2xs border border-slate-800">
              {lang && (
                <div className="bg-slate-800 px-3 py-1.5 text-[8.5px] font-black uppercase text-slate-400 border-b border-slate-900 tracking-wider">
                  {lang}
                </div>
              )}
              <pre className="p-3 text-[10px] font-mono text-emerald-400 overflow-x-auto leading-normal">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        }
        return renderBolds(part);
      });
    }
    return renderBolds(text);
  };

  const renderBolds = (text: string) => {
    if (text.includes('**')) {
      const parts = text.split('**');
      return (
        <span className="whitespace-pre-line">
          {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold text-slate-900">{part}</strong> : part)}
        </span>
      );
    }
    return <span className="whitespace-pre-line">{text}</span>;
  };
  
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
    const courseIds = activeNode.courseIds || ((activeNode as any).courseId ? [(activeNode as any).courseId] : []);

    if (courseIds && courseIds.length > 0) {
      courseIds.forEach((id, index) => {
        list.push({ title: courseIds.length > 1 ? `Course ${index + 1}: ${label}` : `Course: ${label}`, type: 'lesson', url: `/learn/${id}` });
      });
    } else if (contentId) {
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

            {/* AI Tutor Section */}
            <div className="border-t border-slate-100 pt-5 mt-5">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                AI Tutor Assistant
              </h4>
              
              <div className="bg-gradient-to-tr from-purple-50/40 to-indigo-50/30 border border-purple-100/60 rounded-2xl p-4 flex flex-col gap-3.5 shadow-2xs">
                {/* Chat window showing messages */}
                <div className="max-h-60 overflow-y-auto flex flex-col gap-3 p-1 text-xs">
                  <AnimatePresence initial={false}>
                    {chatMessages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-[11px] shadow-3xs ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white self-end rounded-br-none shadow-2xs'
                            : 'bg-white border border-slate-100/80 text-slate-650 self-start rounded-bl-none'
                        }`}
                      >
                        {renderMessageText(msg.text)}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isTyping && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-slate-100/80 text-slate-505 self-start rounded-2xl rounded-bl-none px-3.5 py-2.5 shadow-3xs flex items-center gap-1.5 self-start"
                    >
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </motion.div>
                  )}
                </div>

                {/* Suggestions if empty / starting */}
                {chatMessages.length === 1 && !isTyping && (
                  <div className="flex flex-col gap-1.5 mt-0.5">
                    <span className="text-[9px] font-black uppercase text-purple-400 tracking-wider">Suggested Questions:</span>
                    <div className="flex flex-col gap-1.5">
                      {suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendSuggested(sug)}
                          className="text-[10px] text-left text-purple-700 font-bold bg-white border border-purple-100/70 hover:bg-purple-100/30 hover:border-purple-200 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-3xs flex items-center gap-1.5"
                        >
                          <span className="text-purple-400">✦</span> {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input row */}
                <form onSubmit={handleSendMessage} className="flex gap-2 mt-1 pointer-events-auto">
                  <div className="flex-1 bg-white border border-purple-100/80 rounded-xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-purple-500/10 focus-within:border-purple-500 transition-all flex items-center shadow-3xs">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Ask AI Tutor about ${activeNode.label}...`}
                      className="w-full bg-transparent text-[11px] font-semibold text-slate-700 placeholder-slate-400 outline-hidden border-none leading-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-[11px] font-extrabold transition-all shadow-3xs hover:shadow-xs active:scale-95 cursor-pointer leading-none flex items-center justify-center h-9"
                  >
                    Ask
                  </button>
                </form>
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
