"use client";

import React from "react";
import { MiniMap as ReactFlowMiniMap, MiniMapProps } from "@xyflow/react";

export function MiniMap(props: MiniMapProps) {
  return (
    <ReactFlowMiniMap
      nodeColor="#6366f1"
      maskColor="rgba(240, 242, 245, 0.7)"
      className="!bg-white !border !border-gray-200 !rounded-xl !shadow-md"
      {...props}
    />
  );
}
