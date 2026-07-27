"use client";

import React from "react";
import { NodeProps } from "@xyflow/react";
import { LearningNode } from "./LearningNode";

export function TopicNode(props: NodeProps) {
  return <LearningNode {...props} />;
}

export { LearningNode as TopicNodeComponent };
