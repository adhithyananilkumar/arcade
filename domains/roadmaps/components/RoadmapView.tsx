"use client";

import React from "react";
import { NodeViewProps } from "@tiptap/react";
import { RoadmapNodeView } from "../extensions/RoadmapNodeView";

export function RoadmapView(props: NodeViewProps) {
  return <RoadmapNodeView {...props} />;
}
