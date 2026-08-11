"use client";

import { useRef, useState, useCallback, type CSSProperties } from "react";
import { Plus, BookOpen, ChevronRight, Layers, Zap, Target } from "lucide-react";
import { ArcadeEditor, type ArcadeEditorHandle } from "@/apps/creator/editor/components/ArcadeEditor";
import type * as Y from "yjs";
import type { TiptapDocument } from "@/shared/types/editor.types";

interface ActiveNode {
  questionType: string;
  difficulty: string;
  points: number;
}

interface QuestionBankBuilderLayoutProps {
  activeLessonId: string | null;
  activeYDoc: Y.Doc | null;
  activeSeedContent: TiptapDocument | undefined;
  status: string;
  onSave: (doc: TiptapDocument) => Promise<void>;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "text-emerald-700 bg-emerald-50 border-emerald-200",
  MEDIUM: "text-amber-700 bg-amber-50 border-amber-200",
  HARD: "text-red-700 bg-red-50 border-red-200",
};

export function QuestionBankBuilderLayout({
  activeLessonId,
  activeYDoc,
  activeSeedContent,
  status,
  onSave,
}: QuestionBankBuilderLayoutProps) {
  const editorRef = useRef<ArcadeEditorHandle>(null);
  const [activeNode, setActiveNode] = useState<ActiveNode | null>(null);
  const [questionCount, setQuestionCount] = useState(0);

  const handleSelectionUpdate = useCallback(({ editor }: { editor: any }) => {
    if (editor.isActive("question_bank_creator")) {
      const attrs = editor.getAttributes("question_bank_creator");
      setActiveNode({
        questionType: attrs.questionType || "SINGLE",
        difficulty: attrs.difficulty || "MEDIUM",
        points: attrs.points || 1,
      });
    } else {
      setActiveNode(null);
    }
    // Count questions in the document
    const doc = editor.getJSON();
    const count = (doc?.content || []).filter((n: any) => n.type === "question_bank_creator").length;
    setQuestionCount(count);
  }, []);

  const insertQuestion = useCallback(() => {
    const editor = editorRef.current?.editor;
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: "question_bank_creator",
      content: [{ type: "paragraph" }],
    }).run();
  }, []);

  const insertSection = useCallback(() => {
    const editor = editorRef.current?.editor;
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Section Title" }],
    }).run();
  }, []);

  const updateActiveNode = useCallback((patch: Partial<ActiveNode>) => {
    const editor = editorRef.current?.editor;
    if (!editor || !activeNode) return;
    editor.chain().focus().updateAttributes("question_bank_creator", patch).run();
    setActiveNode({ ...activeNode, ...patch });
  }, [activeNode]);

  const isReadOnly = status === "SUBMITTED";

  if (!activeLessonId || !activeYDoc) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
            <BookOpen size={28} className="text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-700">No section selected</h3>
          <p className="text-sm text-gray-400">Select a section from the sidebar to start building questions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* ── Left canvas column ─────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Fixed sub-toolbar for question bank actions */}
        {!isReadOnly && (
          <div className="flex-shrink-0 flex items-center gap-3 px-8 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mr-auto">
              <Layers size={14} />
              <span className="font-semibold text-gray-700">{questionCount}</span>
              {questionCount === 1 ? "question" : "questions"}
            </div>
            <button
              onClick={insertSection}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Plus size={13} />
              Add Section
            </button>
            <button
              onClick={insertQuestion}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={13} />
              Add Question
            </button>
          </div>
        )}

        {/* Scrollable editor area */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ "--arcade-toolbar-top": "49px" } as CSSProperties}
        >
          <div className="max-w-[740px] mx-auto px-6 py-10 pb-32">
            <ArcadeEditor
              key={activeLessonId}
              ref={editorRef}
              ydoc={activeYDoc}
              seedContent={activeSeedContent}
              placeholder="Click '+ Add Question' to begin building your question bank..."
              onSave={onSave}
              chromeless
              readOnly={isReadOnly}
              contentType="question-bank"
              onSelectionUpdate={handleSelectionUpdate}
            />
            {/* Bottom empty area for easy clicking after last question */}
            <div className="h-20" />
          </div>
        </div>
      </div>

      {/* ── Right Properties Panel ──────────────────────────────── */}
      <aside className="w-72 flex-shrink-0 border-l border-gray-100 bg-gray-50/50 flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 tracking-widest uppercase">
            Properties
          </h3>
        </div>

        {activeNode ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Question Type
              </label>
              <select
                disabled={isReadOnly}
                value={activeNode.questionType}
                onChange={(e) => updateActiveNode({ questionType: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 disabled:opacity-60"
              >
                <option value="SINGLE">Single Choice (MCQ)</option>
                <option value="MULTIPLE">Multiple Choice</option>
                <option value="TRUE_FALSE">True / False</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
                  <button
                    key={d}
                    disabled={isReadOnly}
                    onClick={() => updateActiveNode({ difficulty: d })}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-60 ${
                      activeNode.difficulty === d
                        ? DIFFICULTY_COLORS[d] + " shadow-sm"
                        : "text-gray-500 bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {d.charAt(0) + d.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Points */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Target size={11} /> Points
              </label>
              <div className="flex items-center gap-2">
                <button
                  disabled={isReadOnly || activeNode.points <= 1}
                  onClick={() => updateActiveNode({ points: Math.max(1, activeNode.points - 1) })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 font-bold text-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  disabled={isReadOnly}
                  value={activeNode.points}
                  onChange={(e) => updateActiveNode({ points: parseInt(e.target.value) || 1 })}
                  className="flex-1 text-center bg-white border border-gray-200 rounded-lg py-1.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60"
                />
                <button
                  disabled={isReadOnly}
                  onClick={() => updateActiveNode({ points: activeNode.points + 1 })}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 font-bold text-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Summary card */}
            <div className="mt-2 rounded-xl bg-white border border-indigo-100 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide flex items-center gap-1.5">
                <Zap size={11} /> Summary
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">{activeNode.questionType.replace("_", " ")}</span>
                {" · "}
                <span className={`font-medium ${
                  activeNode.difficulty === "EASY" ? "text-emerald-600" :
                  activeNode.difficulty === "HARD" ? "text-red-600" : "text-amber-600"
                }`}>{activeNode.difficulty}</span>
                {" · "}
                <span className="font-medium">{activeNode.points} pt{activeNode.points !== 1 ? "s" : ""}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-start pt-10 px-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-3">
              <ChevronRight size={16} className="text-gray-400" />
            </div>
            <p className="text-xs font-medium text-gray-500">
              Click on a question card to edit its properties here.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
