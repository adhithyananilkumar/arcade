import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { Plus, Trash2 } from "lucide-react";

export function QuestionBankCreatorView({ node, updateAttributes }: NodeViewProps) {
  const { questionType, difficulty, prompt, options } = node.attrs;

  const handleAddOption = () => {
    updateAttributes({
      options: [...options, { id: crypto.randomUUID(), text: "", isCorrect: false }],
    });
  };

  const handleRemoveOption = (id: string) => {
    updateAttributes({
      options: options.filter((o: any) => o.id !== id),
    });
  };

  const handleOptionChange = (id: string, text: string) => {
    updateAttributes({
      options: options.map((o: any) => (o.id === id ? { ...o, text } : o)),
    });
  };

  const handleToggleCorrect = (id: string) => {
    if (questionType === "SINGLE" || questionType === "TRUE_FALSE") {
      updateAttributes({
        options: options.map((o: any) => ({ ...o, isCorrect: o.id === id })),
      });
    } else {
      updateAttributes({
        options: options.map((o: any) => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)),
      });
    }
  };

  const handleTypeChange = (newType: string) => {
    // If switching to Single Choice, ensure at most one correct option.
    let newOptions = [...options];
    if (newType === "SINGLE" || newType === "TRUE_FALSE") {
      let hasCorrect = false;
      newOptions = newOptions.map((o: any) => {
        if (o.isCorrect && !hasCorrect) {
          hasCorrect = true;
          return o;
        }
        return { ...o, isCorrect: false };
      });
    }
    updateAttributes({ questionType: newType, options: newOptions });
  };

  return (
    <NodeViewWrapper className="my-6">
      <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6 shadow-sm">
        <div className="flex gap-6 mb-6">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">TYPE</label>
            <select
              value={questionType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="SINGLE">Single Choice (MCQ)</option>
              <option value="MULTIPLE">Multiple Choice</option>
              <option value="TRUE_FALSE">True / False</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">DIFFICULTY</label>
            <select
              value={difficulty}
              onChange={(e) => updateAttributes({ difficulty: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">PROMPT</label>
          <textarea
            value={prompt}
            onChange={(e) => updateAttributes({ prompt: e.target.value })}
            placeholder="Enter the question prompt here..."
            rows={3}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2">OPTIONS</label>
          <div className="space-y-3">
            {options.map((opt: any) => (
              <div key={opt.id} className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleCorrect(opt.id)}
                  title={opt.isCorrect ? "Correct answer" : "Mark as correct answer"}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center ${
                    opt.isCorrect ? "border-indigo-600 bg-indigo-600" : "border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {opt.isCorrect && <div className="w-2 h-2 rounded-full bg-white" />}
                </button>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                  placeholder="Option text..."
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={() => handleRemoveOption(opt.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          {questionType !== "TRUE_FALSE" && (
            <button
              onClick={handleAddOption}
              className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <Plus size={16} /> Add Option
            </button>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
