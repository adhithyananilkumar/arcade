import { api } from "@/infrastructure/http/api";
import { ContentDataAdapter, ContentMeta, ContainerNode, LeafNode, RootBadgeNode, Terminology } from "../types";
import { articleService } from "@/domains/articles";
import type { ArticleData } from "@/domains/articles";

export class ArticleAdapter implements ContentDataAdapter {
  terminology: Terminology = {
    root: "Article",
    container: "Article Section",
    leafDocument: "Article Body",
    leafQuiz: "Quiz",
  };

  async loadContent(id: string): Promise<{ meta: ContentMeta; containers: ContainerNode[]; badges: RootBadgeNode[] }> {
    const article = await articleService.getArticle(id);

    return {
      meta: {
        id: article.id,
        title: article.title,
        description: article.description ?? "",
        status: article.status,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        raw: article,
      },
      containers: [
        {
          id: `section-${article.id}`,
          title: "Article Section",
          position: 1,
          expanded: true,
          leaves: [
            {
              id: article.id,
              title: article.title,
              type: "document" as const,
              position: 1,
            },
          ],
        },
      ],
      badges: [],
    };
  }

  async updateMeta(id: string, patch: Partial<ContentMeta>): Promise<void> {
    await articleService.updateArticle(id, {
      title: patch.title,
      description: patch.description,
      status: patch.status as ArticleData["status"],
      categoryId: (patch as any).categoryId,
    });
  }

  async deleteContent(id: string): Promise<void> {
    await articleService.deleteArticle(id);
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
    // No-op — Article has a single fixed section.
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
    // No-op — Article has a single fixed document leaf.
  }

  async renameLeaf(_leafId: string, _title: string, _type: LeafNode["type"]): Promise<void> {
    // No-op
  }

  async getLeafDocument(leafId: string): Promise<{ ydocState: string | null; body: string | null } | null> {
    const res = await api.get<{ ydocState?: string; body: string } | null>(`/api/articles/${leafId}/document`);
    if (!res) return null;
    return { ydocState: res.ydocState ?? null, body: res.body ?? null };
  }

  async saveLeafDocument(leafId: string, payload: { ydocState: string; body: string }): Promise<void> {
    await api.put(`/api/articles/${leafId}/document`, payload);
  }

  async saveLeafVersion(leafId: string, payload: { snapshot?: string; body: string; kind: string; label?: string }): Promise<void> {
    await api.post(`/api/articles/${leafId}/document/versions`, payload);
  }
}
