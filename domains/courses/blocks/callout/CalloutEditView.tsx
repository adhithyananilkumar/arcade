import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import { CALLOUT_VARIANTS, CALLOUT_ICON, CALLOUT_STYLE, toCalloutVariant } from "./shared";

export function CalloutEditView({ node, updateAttributes, selected }: NodeViewProps) {
  const variant = toCalloutVariant(node.attrs.variant);
  const style = CALLOUT_STYLE[variant];

  return (
    <NodeViewWrapper
      className={`my-2 rounded-lg border p-3 ${style.wrap} ${selected ? "ring-1 ring-indigo-300" : ""}`}
      data-drag-handle
    >
      <div className="mb-2 flex items-center gap-1.5">
        {CALLOUT_VARIANTS.map((v) => {
          const Icon = CALLOUT_ICON[v];
          return (
            <button
              key={v}
              type="button"
              contentEditable={false}
              onClick={() => updateAttributes({ variant: v })}
              className={`rounded p-1 ${variant === v ? "bg-white/70 ring-1 ring-gray-300" : "opacity-40 hover:opacity-70"}`}
              title={v}
            >
              <Icon size={14} className={CALLOUT_STYLE[v].icon} />
            </button>
          );
        })}
      </div>
      <div className="flex items-start gap-2">
        {(() => {
          const Icon = CALLOUT_ICON[variant];
          return <Icon size={18} className={`mt-0.5 shrink-0 ${style.icon}`} />;
        })()}
        <div className="min-w-0 flex-1">
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
