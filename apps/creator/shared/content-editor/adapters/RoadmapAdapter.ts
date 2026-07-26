import { ContentDataAdapter, ContentMeta, ContainerNode, LeafNode } from "../types";
import { roadmapService } from "@/domains/roadmaps/services/roadmap";
import type { RoadmapData } from "@/domains/roadmaps/types";

export class RoadmapAdapter implements ContentDataAdapter {
  terminology = {
    root: "Roadmap",
    container: "Roadmap Section",
    leafDocument: "Roadmap Canvas",
    leafQuiz: "Quiz",
  };

  async loadContent(id: string): Promise<{ meta: ContentMeta; containers: ContainerNode[] }> {
    const roadmap = await roadmapService.getRoadmap(id);

    return {
      meta: {
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description ?? "",
        status: roadmap.status,
        createdAt: roadmap.createdAt,
        updatedAt: roadmap.updatedAt,
      },
      containers: [
        {
          id: `section-${roadmap.id}`,
          title: "Roadmap Section",
          position: 1,
          expanded: true,
          leaves: [
            {
              id: roadmap.id,
              title: roadmap.title,
              type: "document" as const,
              position: 1,
            },
          ],
        },
      ],
    };
  }

  async updateMeta(id: string, patch: Partial<ContentMeta>): Promise<void> {
    await roadmapService.updateRoadmap(id, {
      title: patch.title,
      description: patch.description,
      status: patch.status as RoadmapData["status"],
    });
  }

  async deleteContent(id: string): Promise<void> {
    await roadmapService.deleteRoadmap(id);
  }

  async addContainer(_contentId: string, title: string): Promise<ContainerNode> {
    const newId = `section-${Date.now()}`;
    return {
      id: newId,
      title,
      position: 2,
      expanded: true,
      leaves: [],
    };
  }

  async deleteContainer(_containerId: string): Promise<void> {
    // No-op for root section deletion
  }

  async renameContainer(_containerId: string, _title: string): Promise<void> {
    // No-op
  }

  async addLeaf(_containerId: string, title: string, type: LeafNode["type"]): Promise<LeafNode> {
    const newId = `leaf-${Date.now()}`;
    return {
      id: newId,
      title,
      type,
      position: 1,
    };
  }

  async deleteLeaf(_leafId: string, _type: LeafNode["type"]): Promise<void> {
    // No-op
  }

  async renameLeaf(_leafId: string, _title: string, _type: LeafNode["type"]): Promise<void> {
    // No-op
  }

  async getLeafDocument(leafId: string): Promise<{ ydocState: string | null; body: string | null } | null> {
    const roadmap = await roadmapService.getRoadmap(leafId);
    if (!roadmap) return null;

    const initialDoc = {
      type: "doc",
      content: [
        {
          type: "roadmap",
          attrs: {
            roadmapId: roadmap.id,
            graphJson: roadmap.graphJson || JSON.stringify({ nodes: [], edges: [] }),
          },
        },
      ],
    };

    return {
      ydocState: null,
      body: JSON.stringify(initialDoc),
    };
  }

  async saveLeafDocument(leafId: string, payload: { ydocState: string; body: string }): Promise<void> {
    let graphJson: string | undefined;

    try {
      if (payload.body) {
        const doc = JSON.parse(payload.body);
        const findRoadmapNode = (nodes: any[]): any => {
          if (!Array.isArray(nodes)) return null;
          for (const node of nodes) {
            if (node.type === "roadmap" && node.attrs?.graphJson) {
              return node.attrs.graphJson;
            }
            if (node.content) {
              const res = findRoadmapNode(node.content);
              if (res) return res;
            }
          }
          return null;
        };
        const extracted = findRoadmapNode(doc.content);
        if (extracted) {
          graphJson = typeof extracted === "string" ? extracted : JSON.stringify(extracted);
        }
      }
    } catch (e) {
      console.warn("Could not extract graphJson from leaf payload body:", e);
    }

    if (graphJson) {
      await roadmapService.updateRoadmap(leafId, { graphJson });
    }
  }

  async saveLeafVersion(
    _leafId: string,
    _payload: { snapshot?: string; body: string; kind: string; label?: string }
  ): Promise<void> {
    // Standard version history save
  }
}
