import type { Node, Edge, Viewport } from "@xyflow/react";

export interface SerializedGraph {
  nodes: Node[];
  edges: Edge[];
  viewport?: Viewport;
  appearance?: Record<string, any>;
}

export const Serializer = {
  serialize(nodes: Node[], edges: Edge[], viewport?: Viewport, appearance?: Record<string, any>): string {
    const cleanNodes = nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data,
    }));

    const cleanEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      data: e.data,
    }));

    return JSON.stringify({
      nodes: cleanNodes,
      edges: cleanEdges,
      viewport: viewport || { x: 0, y: 0, zoom: 1 },
      appearance,
    });
  },

  deserialize(graphJson?: string): SerializedGraph {
    if (!graphJson) {
      return { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
    }

    try {
      const parsed = typeof graphJson === "string" ? JSON.parse(graphJson) : graphJson;
      const nodes: Node[] = (parsed.nodes || []).map((n: any) => ({
        ...n,
        type: n.type || "default",
      }));
      const edges: Edge[] = (parsed.edges || []).map((e: any) => ({
        ...e,
        type: e.type || "progress",
      }));

      return {
        nodes,
        edges,
        viewport: parsed.viewport || { x: 0, y: 0, zoom: 1 },
        appearance: parsed.appearance,
      };
    } catch (e) {
      console.error("Failed to deserialize graph JSON:", e);
      return { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
    }
  },
};
