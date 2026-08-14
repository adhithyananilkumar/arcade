import { LayoutTemplate } from "lucide-react";
import type { BlockDefinition } from "../types";
import { SectionNode } from "./extension";
import { SectionRender } from "./SectionRender";

export const sectionBlock: BlockDefinition = {
  type: "section",
  extension: SectionNode,
  renderComponent: SectionRender,
  command: {
    id: "section",
    title: "Section with background",
    description: "Group blocks with an optional full-bleed background image",
    icon: LayoutTemplate,
    keywords: ["section", "background", "hero", "banner", "cover", "image"],
    run: (editor, range) => {
      const chain = editor.chain().focus();
      (range ? chain.deleteRange(range) : chain)
        .insertContent({
          type: "section",
          attrs: { backgroundImage: null, overlayOpacity: 0.35, focalPoint: "center", minHeight: 240 },
          content: [{ type: "paragraph" }],
        })
        .run();
    },
  },
};
