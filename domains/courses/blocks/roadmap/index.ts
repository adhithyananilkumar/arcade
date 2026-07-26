import { Map } from "lucide-react";
import type { BlockDefinition } from "../types";
import { RoadmapNode } from "@/domains/roadmaps";

export const roadmapBlock: BlockDefinition = {
  type: "roadmap",
  extension: RoadmapNode,
  command: {
    id: "roadmap",
    title: "Roadmap",
    description: "Embed an interactive learning roadmap",
    icon: Map,
    keywords: ["roadmap", "path", "map"],
    run: (editor, range) => {
      const chain = editor.chain().focus();
      (range ? chain.deleteRange(range) : chain)
        .insertContent({
          type: "roadmap",
          attrs: {
            roadmapId: `roadmap-${Date.now()}`,
            graphJson: JSON.stringify({ nodes: [], edges: [] }),
          },
        })
        .run();
    },
  },
};
