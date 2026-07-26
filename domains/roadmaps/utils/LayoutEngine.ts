import dagre from "dagre";
import { Position, type Node, type Edge } from "@xyflow/react";

export interface LayoutOptions {
  direction?: "TB" | "LR" | "BT" | "RL";
  nodeWidth?: number;
  nodeHeight?: number;
}

export const LayoutEngine = {
  getLayoutedElements(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions = {}
  ): { nodes: Node[]; edges: Edge[] } {
    const { direction = "TB", nodeWidth = 240, nodeHeight = 120 } = options;
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === "LR" || direction === "RL";
    dagreGraph.setGraph({
      rankdir: direction,
      nodesep: 50,
      ranksep: 80,
    });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes: Node[] = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  },
};
