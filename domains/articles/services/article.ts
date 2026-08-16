import { api } from "@/infrastructure/http/api";
import type { ArticleData } from "../types";

export const articleService = {
  getAllArticles: () => api.get<ArticleData[]>(`/api/articles`),
  getArticle: (id: string) => api.get<ArticleData>(`/api/articles/${id}`),
  createArticle: (data: { title: string; description?: string; channelId: string }) =>
    api.post<ArticleData>(`/api/articles`, data),
  updateArticle: (
    id: string,
    data: {
      title?: string;
      description?: string;
      coverImageUrl?: string;
      version?: number;
      status?: string;
      categoryId?: string | null;
    }
  ) => api.put<ArticleData>(`/api/articles/${id}`, data),
  deleteArticle: (id: string) => api.delete<void>(`/api/articles/${id}`),
  submitArticle: (id: string, message?: string) =>
    api.post<ArticleData>(`/api/articles/${id}/submit`, { message }),
  approveArticle: (id: string, note?: string) =>
    api.post<ArticleData>(`/api/articles/${id}/approve`, { note }),
  rejectArticle: (id: string, reason: string) =>
    api.post<ArticleData>(`/api/articles/${id}/reject`, { reason }),
  revertToDraft: (id: string) => api.post<ArticleData>(`/api/articles/${id}/edit`, {}),
  getArticleStatusHistory: (id: string) => api.get<any[]>(`/api/articles/${id}/status-history`),
};
