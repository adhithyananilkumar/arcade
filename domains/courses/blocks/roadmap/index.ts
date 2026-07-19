import { Map } from "lucide-react";
import type { BlockDefinition } from "../types";
import { RoadmapNode } from "@/domains/roadmaps";

// Roadmap predates the block registry — its own extensions/components/hooks/services
// tree lives under editor/roadmap/. This wrapper just registers it into the shared
// registry so authoring wiring and the command palette have one source of truth.
// It has no learner-facing renderComponent yet (see docs/render-engine-future-work.md);
// TiptapContentView falls back to rendering its children until one is built.
export const roadmapBlock: BlockDefinition = {
  type: "roadmap",
  extension: RoadmapNode,
  command: {
    id: "roadmap",
    title: "Roadmap",
    description: "Embed a learning roadmap",
    icon: Map,
    keywords: ["roadmap", "path", "map"],
    run: (editor, range) => {
      const id =
        window.prompt("Enter roadmap ID (or leave blank for demo):") ||
        "00000000-0000-0000-0000-000000000000";
      const chain = editor.chain().focus();
      (range ? chain.deleteRange(range) : chain)
        .insertContent({ type: "roadmap", attrs: { roadmapId: id } })
        .run();
    },
  },
};
