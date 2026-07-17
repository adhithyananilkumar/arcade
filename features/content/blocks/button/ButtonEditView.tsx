import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { MousePointerClick, Link2 } from "lucide-react";

const VARIANTS = ["primary", "secondary"] as const;

export function ButtonEditView({ node, updateAttributes, selected }: NodeViewProps) {
  const { label, url, variant } = node.attrs as {
    label: string;
    url: string;
    variant: (typeof VARIANTS)[number];
  };

  return (
    <NodeViewWrapper
      className={`my-2 rounded-lg border p-3 ${selected ? "border-indigo-400 ring-1 ring-indigo-200" : "border-gray-200"}`}
      data-drag-handle
    >
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-400">
        <MousePointerClick size={13} /> Button
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={label}
          onChange={(e) => updateAttributes({ label: e.target.value })}
          placeholder="Button label"
          className="min-w-0 flex-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-sm font-medium outline-none focus:border-indigo-400"
        />
        <div className="flex min-w-0 flex-[2] items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 focus-within:border-indigo-400">
          <Link2 size={14} className="shrink-0 text-gray-400" />
          <input
            value={url}
            onChange={(e) => updateAttributes({ url: e.target.value })}
            placeholder="https://…"
            className="min-w-0 flex-1 text-sm outline-none"
          />
        </div>
        <div className="flex overflow-hidden rounded-md border border-gray-200">
          {VARIANTS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => updateAttributes({ variant: v })}
              className={`px-2.5 py-1.5 text-xs capitalize ${
                variant === v ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
