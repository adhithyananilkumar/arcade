"use client";

import React from "react";
import { EdgeProps } from "@xyflow/react";
import { ProgressEdge } from "./ProgressEdge";

export function ConnectionEdge(props: EdgeProps) {
  return <ProgressEdge {...props} />;
}

export { ProgressEdge as ConnectionEdgeComponent };
