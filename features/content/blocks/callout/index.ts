import { Info } from "lucide-react";
import type { BlockDefinition } from "../types";
import { CalloutNode } from "./extension";
import { CalloutRender } from "./CalloutRender";

export const calloutBlock: BlockDefinition = {
  type: "callout",
  extension: CalloutNode,
  renderComponent: CalloutRender,
  command: {
    id: "callout",
    title: "Callout",
    description: "Highlighted info, warning, success or danger note",
    icon: Info,
    keywords: ["callout", "note", "info", "warning", "banner", "alert", "tip"],
    run: (editor, range) => {
      const chain = editor.chain().focus();
      (range ? chain.deleteRange(range) : chain)
        .insertContent({
          type: "callout",
          attrs: { variant: "info" },
          content: [{ type: "paragraph" }],
        })
        .run();
    },
  },
};
