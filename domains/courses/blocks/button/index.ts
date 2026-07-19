import { MousePointerClick } from "lucide-react";
import type { BlockDefinition } from "../types";
import { ButtonNode } from "./extension";
import { ButtonRender } from "./ButtonRender";

export const buttonBlock: BlockDefinition = {
  type: "cta-button",
  extension: ButtonNode,
  renderComponent: ButtonRender,
  command: {
    id: "cta-button",
    title: "Button",
    description: "A clickable call-to-action button",
    icon: MousePointerClick,
    keywords: ["button", "cta", "link", "click"],
    run: (editor, range) => {
      const chain = editor.chain().focus();
      (range ? chain.deleteRange(range) : chain)
        .insertContent({ type: "cta-button", attrs: { label: "Click me", url: "", variant: "primary" } })
        .run();
    },
  },
};
