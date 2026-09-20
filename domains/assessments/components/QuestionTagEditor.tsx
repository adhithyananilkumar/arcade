"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";

/**
 * Free-form topic tags on a question.
 *
 * <p>Tags are what make a dynamic pool worth having: "Java · Medium" can only stay correct on its
 * own if questions carry something to filter by beyond their section and difficulty. Deliberately
 * uncontrolled vocabulary — an author types whatever their subject needs, and `suggestions` offers
 * the tags already in use in this bank so the set converges without being enforced.
 */
export function QuestionTagEditor({
  tags,
  suggestions = [],
  onChange,
  disabled,
}: {
  tags: string[];
  suggestions?: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    // Comma-splitting here means pasting "oop, inheritance, java" adds three tags rather than one
    // long one — the shape people actually paste.
    const next = raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (next.length === 0) return;
    onChange([...tags, ...next]);
    setDraft("");
  };

  const unusedSuggestions = suggestions.filter((s) => !tags.includes(s)).slice(0, 6);

  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <Tag size={12} /> Tags
      </span>

      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-1 pl-2.5 pr-1 text-[11px] font-semibold text-indigo-700"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                title={`Remove ${tag}`}
                className="rounded-full p-0.5 text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
              >
                <X size={11} />
              </button>
            )}
          </span>
        ))}

        {!disabled && (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                commit(draft);
              } else if (e.key === "Backspace" && !draft && tags.length > 0) {
                onChange(tags.slice(0, -1));
              }
            }}
            onBlur={() => commit(draft)}
            placeholder={tags.length === 0 ? "Add a tag…" : ""}
            aria-label="Add a tag"
            className="min-w-[110px] flex-1 rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-xs text-[#14142b] outline-none placeholder:text-slate-300 focus:border-slate-200 focus:bg-white"
          />
        )}
      </div>

      {!disabled && unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">Used here</span>
          {unusedSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange([...tags, s])}
              className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
