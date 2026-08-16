export interface ArticleData {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  version: number;
  status: "draft" | "SUBMITTED" | "PUBLISHED" | "archived" | string;
  publishedAt?: string;
  publishedBy?: string;
  archivedAt?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}
