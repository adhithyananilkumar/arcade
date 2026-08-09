'use client';

import React from "react";
import type { NodeProgressData } from "../types";
import { RoadmapNode } from "./RoadmapNode";

export function StudentLearningObjectNode({ data, id }: any) {
  const progress: NodeProgressData | undefined = data.progress;
  const status = progress?.status || "NOT_STARTED";
  const isCompleted = status === "COMPLETED";
  const isCurrent = status === "IN_PROGRESS";

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onClick) {
      data.onClick(id, data);
    }
  };

  return (
    <div 
      className="w-full h-full"
      onClick={() => {
        if (data.onClick) {
          data.onClick(id, data);
        }
      }}
    >
      <RoadmapNode
        id={id}
        label={data.title || ""}
        description={data.description || ""}
        nodeType={data.nodeType || data.type || "lesson"}
        difficulty={data.difficulty}
        duration={data.duration || (data.durationMinutes ? `${data.durationMinutes}m` : '')}
        color={data.color}
        fontColor={data.fontColor}
        fontFamily={data.fontFamily}
        isCompleted={isCompleted}
        isCurrent={isCurrent}
        editable={false}
        showHandles={true}
        shape={data.shape || 'rectangle'}
        onCheckboxClick={handleCheckboxClick}
      />
    </div>
  );
}
