'use client';

import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import { ChevronRight, ListTree } from "lucide-react";
import { useState } from "react";

export function ToggleEditView({ node, updateAttributes, selected }: NodeViewProps) {
  const [open, setOpen] = useState(true);
  const title = typeof node.attrs.title === "string" ? node.attrs.title : "Toggle";

  return (
    <NodeViewWrapper
      className={`my-2 rounded-lg border p-3 ${selected ? "border-indigo-400 ring-1 ring-indigo-200" : "border-gray-200"}`}
      data-drag-handle
    >
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-400">
        <ListTree size={13} /> Toggle
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          contentEditable={false}
          className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100"
        >
          <ChevronRight size={16} className={`transition-transform ${open ? "rotate-90" : ""}`} />
        </button>
        <input
          value={title}
          onChange={(e) => updateAttributes({ title: e.target.value })}
          placeholder="Toggle title"
          className="flex-1 rounded-md px-1 py-1 text-sm font-semibold outline-none focus:bg-gray-50"
        />
      </div>
      <div className={open ? "mt-2 border-l-2 border-gray-100 pl-4" : "hidden"}>
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
}
