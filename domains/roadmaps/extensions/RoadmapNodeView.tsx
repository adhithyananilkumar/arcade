"use client";

import React, { useCallback } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { RoadmapCanvas } from "../components/RoadmapCanvas";

export function RoadmapNodeView({ node, updateAttributes, editor }: NodeViewProps) {
  const roadmapId = node.attrs.roadmapId || "00000000-0000-0000-0000-000000000000";
  const graphJson = node.attrs.graphJson || JSON.stringify({ nodes: [], edges: [] });
  const isEditable = editor.isEditable;
  const mode = isEditable ? "edit" : "view";
  const contentType = (editor as any).contentType;

  const handleGraphChange = useCallback(
    (newGraphJson: string) => {
      if (isEditable) {
        updateAttributes({ graphJson: newGraphJson });
      }
    },
    [isEditable, updateAttributes]
  );

  return (
    <NodeViewWrapper className="roadmap-node-view w-full h-[calc(100vh-80px)] min-h-[600px] my-0 p-0 relative flex flex-col flex-1">
      <div contentEditable={false} className="w-full h-full min-h-[600px] flex-1 flex flex-col">
        <RoadmapCanvas
          roadmap={{ id: roadmapId, graphJson }}
          mode={mode}
          onGraphChange={handleGraphChange}
          readOnly={!isEditable}
          contentType={contentType}
        />
      </div>
    </NodeViewWrapper>
  );
}
