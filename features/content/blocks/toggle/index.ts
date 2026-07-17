import { ListTree } from "lucide-react";
import type { BlockDefinition } from "../types";
import { ToggleNode } from "./extension";
import { ToggleRender } from "./ToggleRender";

export const toggleBlock: BlockDefinition = {
  type: "toggle",
  extension: ToggleNode,
  renderComponent: ToggleRender,
  command: {
    id: "toggle",
    title: "Toggle",
    description: "Collapsible section learners can expand",
    icon: ListTree,
    keywords: ["toggle", "collapse", "expand", "details", "reveal", "hint"],
    run: (editor, range) => {
      const chain = editor.chain().focus();
      (range ? chain.deleteRange(range) : chain)
        .insertContent({
          type: "toggle",
          attrs: { title: "Toggle", nodeId: crypto.randomUUID() },
          content: [{ type: "paragraph" }],
        })
        .run();
    },
  },
};
