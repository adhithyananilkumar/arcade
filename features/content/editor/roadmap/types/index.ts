export interface RoadmapData {
  id: string;
  title: string;
  description: string;
  ownerType: string;
  ownerId: string;
  graphJson: string;
  version: number;
  status: 'draft' | 'review' | 'published' | 'archived';
  publishedAt?: string;
  publishedBy?: string;
  archivedAt?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}
