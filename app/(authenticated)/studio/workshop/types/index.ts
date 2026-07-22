export enum WorkshopStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum WorkshopType {
  WORKSHOP = 'WORKSHOP',
  BOOTCAMP = 'BOOTCAMP',
  MASTERCLASS = 'MASTERCLASS',
  WEBINAR = 'WEBINAR',
  AMA = 'AMA',
}

export enum DeliveryMode {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  HYBRID = 'HYBRID',
  RECORDED = 'RECORDED',
}

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  UNLISTED = 'UNLISTED',
}

export interface Workshop {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  description?: string;
  status: WorkshopStatus;
  category: string;
  tags?: string[];
  thumbnailUrl?: string;
  coverImageUrl?: string;
  promoVideoUrl?: string;
  workshopType: WorkshopType;
  deliveryMode: DeliveryMode;
  difficulty: Difficulty;
  language: string;
  price: number;
  currency: string;
  capacity?: number;
  visibility: Visibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateWorkshopRequest = Omit<Workshop, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'status'>;

export interface WorkshopFormData extends Partial<CreateWorkshopRequest> {
  title: string;
  category: string;
  language: string;
}
