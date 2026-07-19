import { ChevronRight } from "lucide-react";
import type { BlockRenderProps } from "../types";
import { useBlockState } from "@/shared/contexts/BlockStateContext";

export function ToggleRender({ node, children }: BlockRenderProps) {
  const nodeId = typeof node.attrs?.nodeId === "string" ? node.attrs.nodeId : undefined;
  const [{ open }, setToggleState] = useBlockState(nodeId, { open: false });
  const setOpen = (next: boolean | ((prev: boolean) => boolean)) =>
    setToggleState({ open: typeof next === "function" ? next(open) : next });
  const title = typeof node.attrs?.title === "string" && node.attrs.title ? node.attrs.title : "Toggle";

  return (
    <div className="mb-4 rounded-lg border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50"
        aria-expanded={open}
      >
        <ChevronRight size={16} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`} />
        {title}
      </button>
      {open && <div className="border-t border-gray-100 px-4 py-3">{children}</div>}
    </div>
  );
}
