"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, GripVertical, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { MiniRichTextEditor } from "./MiniRichTextEditor";
import { CourseAdapter } from "@/apps/creator/shared/content-editor/adapters/CourseAdapter";
import * as Y from "yjs";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type QuestionType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  prompt: any;
  options: Option[];
}

export function QuestionBankSectionView({ 
  courseId,
  readOnly 
}: { 
  courseId: string; 
  readOnly?: boolean; 
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lessonId, setLessonId] = useState<string | null>(null);

  // Form State for editing/adding
  const [formState, setFormState] = useState<Question | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const adapter = new CourseAdapter();
        const content = await adapter.loadContent(courseId);
        
        // Find the first document leaf and assume it's our Question Bank storage
        let targetLeafId = null;
        for (const container of content.containers) {
          const leaf = container.leaves.find(l => l.title.toLowerCase().includes("bank") || l.type === "document");
          if (leaf) {
            targetLeafId = leaf.id;
            break;
          }
        }

        if (targetLeafId) {
          setLessonId(targetLeafId);
          const doc = await adapter.getLeafDocument(targetLeafId);
          if (doc && doc.body) {
            try {
              const parsed = JSON.parse(doc.body);
              const loadedQuestions = parsed.content
                ?.filter((node: any) => node.type === "question_bank_creator")
                .map((node: any) => ({
                  id: crypto.randomUUID(),
                  type: node.attrs.questionType || "SINGLE",
                  difficulty: node.attrs.difficulty || "MEDIUM",
                  prompt: node.attrs.prompt || null,
                  options: node.attrs.options || []
                })) || [];
              setQuestions(loadedQuestions);
            } catch (e) {
              console.error("Failed to parse question bank JSON", e);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load question bank", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [courseId]);

  const saveToBackend = async (newQuestions: Question[]) => {
    if (!lessonId) return;
    setIsSaving(true);
    try {
      const tiptapJson = {
        type: "doc",
        content: newQuestions.map(q => ({
          type: "question_bank_creator",
          attrs: {
            questionType: q.type,
            difficulty: q.difficulty,
            prompt: q.prompt,
            options: q.options
          }
        }))
      };
      
      const jsonStr = JSON.stringify(tiptapJson);
      // We must provide a valid Yjs state for the backend endpoint as well
      const ydoc = new Y.Doc();
      const ymap = ydoc.getMap("document"); // or whatever Tiptap default is, usually xmlFragment
      const yjsState = Buffer.from(Y.encodeStateAsUpdate(ydoc)).toString("base64");

      const adapter = new CourseAdapter();
      await adapter.saveLeafDocument(lessonId, { currentBody: jsonStr, currentYdoc: yjsState });
    } catch (err) {
      console.error("Failed to save question bank", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: "SINGLE",
      difficulty: "MEDIUM",
      prompt: null,
      options: [
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false }
      ]
    };
    setFormState(newQuestion);
    setIsEditing(newQuestion.id);
  };

  const handleSaveForm = () => {
    if (!formState) return;
    
    const newQuestions = (() => {
      const exists = questions.find(q => q.id === formState.id);
      if (exists) {
        return questions.map(q => q.id === formState.id ? formState : q);
      }
      return [...questions, formState];
    })();
    
    setQuestions(newQuestions);
    saveToBackend(newQuestions);
    setFormState(null);
    setIsEditing(null);
  };

  const handleEditQuestion = (q: Question) => {
    setFormState({ ...q });
    setIsEditing(q.id);
  };

  const handleDeleteQuestion = (id: string) => {
    const newQuestions = questions.filter(q => q.id !== id);
    setQuestions(newQuestions);
    saveToBackend(newQuestions);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-50 border border-gray-200 p-4 rounded-xl">
        <h2 className="text-lg font-bold text-gray-800">
          Total Questions: {questions.length}
          {isSaving && <span className="ml-4 text-sm text-gray-400 font-normal">Saving...</span>}
        </h2>
        
        {!readOnly && (
          <button 
            onClick={handleAddQuestion}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Add Question
          </button>
        )}
      </div>

      <div className="space-y-4">
        {questions.length === 0 && !isEditing && (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <h3 className="text-gray-900 font-medium">No questions yet</h3>
            <p className="text-sm text-gray-500 mt-1">Click "Add Question" to start building your bank.</p>
          </div>
        )}

        {questions.map((q, index) => {
          if (isEditing === q.id && formState) {
            return <QuestionEditorForm key={q.id} state={formState} setState={setFormState} onSave={handleSaveForm} onCancel={() => setIsEditing(null)} />;
          }

          return (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-start gap-4 group">
              <div className="pt-1 text-gray-400 cursor-grab">
                <GripVertical size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-gray-400">Q{index + 1}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    q.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                    q.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {q.difficulty}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider">
                    {q.type.replace('_', ' ')}
                  </span>
                </div>
                {/* Render prompt (if it's plain text or rich JSON, just stringify for preview or use a basic string representation) */}
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {typeof q.prompt === 'string' ? q.prompt : q.prompt ? "Rich text prompt..." : "Empty prompt"}
                </p>
              </div>
              {!readOnly && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditQuestion(q)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {isEditing && !questions.find(q => q.id === isEditing) && formState && (
          <QuestionEditorForm state={formState} setState={setFormState} onSave={handleSaveForm} onCancel={() => setIsEditing(null)} />
        )}
      </div>
    </div>
  );
}

function QuestionEditorForm({ 
  state, 
  setState, 
  onSave, 
  onCancel 
}: { 
  state: Question, 
  setState: (s: Question) => void, 
  onSave: () => void, 
  onCancel: () => void 
}) {
  
  const handleAddOption = () => {
    setState({
      ...state,
      options: [...state.options, { id: crypto.randomUUID(), text: "", isCorrect: false }]
    });
  };

  const handleRemoveOption = (id: string) => {
    setState({
      ...state,
      options: state.options.filter(o => o.id !== id)
    });
  };

  const handleOptionChange = (id: string, text: string) => {
    setState({
      ...state,
      options: state.options.map(o => o.id === id ? { ...o, text } : o)
    });
  };

  const handleToggleCorrect = (id: string) => {
    if (state.type === "SINGLE" || state.type === "TRUE_FALSE") {
      setState({
        ...state,
        options: state.options.map(o => ({ ...o, isCorrect: o.id === id }))
      });
    } else {
      setState({
        ...state,
        options: state.options.map(o => o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-indigo-500 p-6 shadow-md">
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Type</label>
          <select 
            value={state.type}
            onChange={(e) => {
              const newType = e.target.value as QuestionType;
              const newOptions = newType === "TRUE_FALSE" 
                ? [
                    { id: crypto.randomUUID(), text: "True", isCorrect: true },
                    { id: crypto.randomUUID(), text: "False", isCorrect: false }
                  ] 
                : state.options;
              setState({ ...state, type: newType, options: newOptions });
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
          >
            <option value="SINGLE">Single Choice (MCQ)</option>
            <option value="MULTIPLE">Multiple Choice</option>
            <option value="TRUE_FALSE">True / False</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Difficulty</label>
          <select 
            value={state.difficulty}
            onChange={(e) => setState({ ...state, difficulty: e.target.value as Difficulty })}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Prompt</label>
        <MiniRichTextEditor 
          value={state.prompt}
          onChange={(val) => setState({ ...state, prompt: val })}
          placeholder="Enter the question prompt here..."
          minHeight={120}
        />
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Options</label>
        <div className="space-y-3">
          {state.options.map((opt) => (
            <div key={opt.id} className={`flex items-center gap-3 p-2 rounded-xl border ${opt.isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <button 
                onClick={() => handleToggleCorrect(opt.id)}
                className={`p-1.5 rounded-full transition-colors ${opt.isCorrect ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                title="Mark as correct"
              >
                {opt.isCorrect ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
              
              <input 
                type="text"
                value={opt.text}
                onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                placeholder="Option text..."
                readOnly={state.type === "TRUE_FALSE"}
                className={`flex-1 bg-transparent text-sm outline-none ${state.type === "TRUE_FALSE" ? "font-medium" : ""}`}
              />

              {state.type !== "TRUE_FALSE" && (
                <button 
                  onClick={() => handleRemoveOption(opt.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        {state.type !== "TRUE_FALSE" && (
          <button 
            onClick={handleAddOption}
            className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <Plus size={14} /> Add Option
          </button>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button 
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={onSave}
          disabled={!state.prompt || state.options.every(o => !o.text) || !state.options.some(o => o.isCorrect)}
          className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Question
        </button>
      </div>
    </div>
  );
}
