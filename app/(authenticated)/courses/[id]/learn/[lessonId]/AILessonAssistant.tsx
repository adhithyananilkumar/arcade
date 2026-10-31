'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import type { LessonResponse } from '@/shared/types/api.types';
import { Send, RotateCcw, Bot, User, Check, Copy, Loader2, Lightbulb, HelpCircle, BookOpen } from 'lucide-react';
import { ArcadeAIIcon } from '@/shared/design-system/ui/ArcadeAIIcon';

interface AILessonAssistantProps {
  lesson: LessonResponse | null;
  assessmentTitle?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

function extractTextFromBody(body: unknown): string {
  if (!body) return '';
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      return extractFromNode(parsed);
    } catch {
      return body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }
  if (typeof body === 'object') {
    return extractFromNode(body);
  }
  return '';
}

function extractFromNode(node: any): string {
  if (!node) return '';
  let text = '';
  if (node.text) text += node.text + ' ';
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      text += extractFromNode(child) + ' ';
    }
  }
  return text.trim();
}

export function AILessonAssistant({ lesson, assessmentTitle }: AILessonAssistantProps) {
  const lessonTitle = lesson?.title || assessmentTitle || 'this lesson';
  const plainText = useMemo(() => extractTextFromBody(lesson?.body), [lesson?.body]);

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your AI tutor for **${lessonTitle}**. Ask me questions, request summaries, or test your understanding!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Update initial message when lesson or assessment changes
  useEffect(() => {
    setMessages([
      {
        id: `welcome-${lesson?.id || assessmentTitle || 'none'}`,
        role: 'assistant',
        content: `Hello! I'm your AI tutor for **${lessonTitle}**. How can I help you learn today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [lesson?.id, assessmentTitle, lessonTitle]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Conversation reset. Ready to explore **${lessonTitle}**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const generateAnswer = (userPrompt: string): string => {
    const p = userPrompt.toLowerCase();

    if (p.includes('summar') || p.includes('brief') || p.includes('overview')) {
      if (plainText.length > 30) {
        return `### 📌 Summary of ${lessonTitle}\n\nHere is a quick overview of what this lesson covers:\n\n• **Core Topic**: ${lessonTitle}\n• **Key Concepts**: ${plainText.slice(0, 160)}…\n• **Application**: Review the lesson material and take note of the practical takeaways discussed above.`;
      }
      return `### 📌 Summary of ${lessonTitle}\n\nThis lesson introduces fundamental concepts related to **${lessonTitle}**. Read through the lesson steps carefully to master these essentials!`;
    }

    if (p.includes('key takeaway') || p.includes('points') || p.includes('highlights')) {
      return `### 💡 Key Takeaways for ${lessonTitle}\n\n1. **Core Understanding**: Master the main principles outlined in ${lessonTitle}.\n2. **Best Practices**: Apply recommended workflows and conventions.\n3. **Practical Retention**: Write down quick notes in the Notes tab to solidify your learning!`;
    }

    if (p.includes('quiz') || p.includes('test') || p.includes('question')) {
      return `### ❓ Knowledge Check\n\n**Question**: In your own words, what is the primary goal of **${lessonTitle}**, and why is it important in real-world applications?\n\n*Tip: Try replying with your answer here or write it down in your Notes!*`;
    }

    if (p.includes('explain') || p.includes('simple') || p.includes('what is')) {
      if (plainText.length > 30) {
        return `**${lessonTitle}** explained simply:\n\nIt focuses on: "${plainText.slice(0, 140)}…"\n\nIn short, it provides you with the foundational understanding and actionable steps needed to apply this skill effectively.`;
      }
      return `**${lessonTitle}** is designed to guide you step-by-step through this topic. Focus on the core explanations and follow along with the examples provided in the lesson!`;
    }

    return `Great question regarding **${lessonTitle}**! \n\nWhen working through ${lessonTitle}, always consider how the concepts connect to the broader course structure. Let me know if you would like a summary, key takeaways, or a quick quiz!`;
  };

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isThinking) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Realistic responsive AI delay
    setTimeout(() => {
      const answer = generateAnswer(query);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 500);
  };

  const quickPrompts = [
    { label: 'Summarize lesson', icon: BookOpen, prompt: 'Summarize this lesson for me.' },
    { label: 'Key takeaways', icon: Lightbulb, prompt: 'What are the key takeaways from this lesson?' },
    { label: 'Quiz me', icon: HelpCircle, prompt: 'Can you quiz me on this lesson?' },
  ];

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      {/* Header bar */}
      <div className="mb-2 flex items-center justify-between border-b border-ink/5 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-ink/5 text-ink dark:bg-white/10 dark:text-white">
            <ArcadeAIIcon size={15} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-ink">AI Study Assistant</p>
            <p className="text-[10px] text-slate-400 truncate max-w-[170px]">{lessonTitle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          title="Reset chat"
          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/10"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      {/* Messages list */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 text-xs arcade-scrollbar-mini">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`group relative max-w-[90%] rounded-2xl p-3 shadow-xs transition-all leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-ink text-on-ink rounded-tr-xs'
                  : 'border border-white/50 bg-white/70 text-slate-800 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 rounded-tl-xs backdrop-blur-md'
              }`}
            >
              <div className="whitespace-pre-wrap">
                {msg.content.split('\n').map((line, idx) => {
                  if (line.startsWith('### ')) {
                    return (
                      <p key={idx} className="mb-1 font-bold text-ink dark:text-white">
                        {line.replace('### ', '')}
                      </p>
                    );
                  }
                  if (line.startsWith('• ') || line.startsWith('- ')) {
                    return (
                      <p key={idx} className="ml-2 mb-0.5">
                        {line}
                      </p>
                    );
                  }
                  return (
                    <p key={idx} className={line.trim() === '' ? 'h-1.5' : 'mb-1'}>
                      {line}
                    </p>
                  );
                })}
              </div>

              {msg.role === 'assistant' && (
                <button
                  type="button"
                  onClick={() => handleCopy(msg.id, msg.content)}
                  title="Copy response"
                  className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 p-1 text-slate-400 hover:text-ink cursor-pointer"
                >
                  {copiedId === msg.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                </button>
              )}
            </div>
            <span className="mt-0.5 px-1 text-[9px] text-slate-400">{msg.timestamp}</span>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-white/50 bg-white/70 px-3 py-2 text-xs text-slate-500 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60">
            <Loader2 size={12} className="animate-spin text-ink" />
            <span className="text-[11px] font-medium">Analyzing lesson…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips */}
      <div className="mt-2 flex flex-wrap gap-1 border-t border-ink/5 pt-2">
        {quickPrompts.map((chip) => {
          const ChipIcon = chip.icon;
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => handleSend(chip.prompt)}
              className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-white/60 px-2.5 py-1 text-[10px] font-semibold text-ink transition-all hover:bg-ink hover:text-on-ink active:scale-95 cursor-pointer dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/20"
            >
              <ChipIcon size={10} className="shrink-0 text-ink/70" />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-2 flex items-center gap-1.5"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${lessonTitle}…`}
          className="flex-1 rounded-full border border-white/60 bg-white/70 px-3.5 py-2 text-xs text-ink placeholder:text-slate-400 shadow-xs backdrop-blur-md transition-all focus:border-ink/40 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
        />
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          title="Send message"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-on-ink shadow-xs transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 cursor-pointer"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
