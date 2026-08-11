"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Plus, ArrowLeft } from "lucide-react";

export default function ExamConfigPage() {
  const router = useRouter();
  
  const [examType, setExamType] = useState("CERTIFICATION");
  const [rules, setRules] = useState({ EASY: 20, MEDIUM: 50, HARD: 30 });
  
  const [mockPool] = useState([
    { id: "q1", title: "What is React?", difficulty: "EASY" },
    { id: "q2", title: "Explain Virtual DOM", difficulty: "MEDIUM" },
    { id: "q3", title: "Reconciliation process", difficulty: "HARD" },
  ]);

  const handleSave = () => {
    // In a real implementation, we would save this to the backend
    // and/or update the Tiptap document if it was externally synced.
    router.back(); // Go back to the editor
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col items-center py-10 px-4 h-full min-h-screen">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="border-b border-gray-100 px-8 py-6 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="text-indigo-600" />
              Configure Exam Component
            </h1>
          </div>
        </div>

        <div className="p-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Exam Mode</label>
              <select 
                value={examType}
                onChange={(e) => {
                  const type = e.target.value;
                  setExamType(type);
                  if (type === "CERTIFICATION") {
                    setRules({ EASY: 20, MEDIUM: 50, HARD: 30 });
                  } else {
                    setRules({ EASY: 80, MEDIUM: 20, HARD: 0 });
                  }
                }}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              >
                <option value="CERTIFICATION">Certification Exam (Rigorous)</option>
                <option value="BADGE">Badge Claim (Lightweight)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Certification exams pull harder questions from the bank, whereas badges focus on fundamentals.
              </p>
            </div>

            {/* Difficulty Rules */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Difficulty Target (%)</label>
              <div className="flex gap-4">
                {(['EASY', 'MEDIUM', 'HARD'] as const).map(diff => (
                  <div key={diff} className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <label className="block text-xs font-medium text-gray-600 mb-2">{diff}</label>
                    <input 
                      type="number"
                      min="0" max="100"
                      value={rules[diff]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setRules({ ...rules, [diff]: val });
                      }}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-center outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selection Pool UI */}
          <div className="pt-8 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Generated Selection Pool</h2>
                <p className="text-sm text-gray-500">Based on your difficulty targets, these questions will be served to the student.</p>
              </div>
              <button className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
                <Plus size={16} /> Override Selection
              </button>
            </div>
            
            <div className="space-y-3">
              {mockPool.map(q => (
                <div key={q.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-indigo-200 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {q.id}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{q.title}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    q.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                    q.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 p-6 bg-gray-50 flex justify-end gap-4 rounded-b-2xl">
          <button 
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
