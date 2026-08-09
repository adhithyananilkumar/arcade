// Canonical Event types — replaces the legacy Workshop types
export type EventType = 'WORKSHOP' | 'WEBINAR' | 'BOOTCAMP' | 'MASTERCLASS' | 'AMA';
export type EventStatus = 'DRAFT' | 'SUBMITTED' | 'REJECTED' | 'APPROVED' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED' | 'COMPLETED';
export type DeliveryMode = 'ONLINE' | 'OFFLINE' | 'HYBRID' | 'RECORDED';

export interface EventDto {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  description?: string;
  status: EventStatus;
  category: string;
  tags: string[];
  thumbnailUrl?: string;
  coverImageUrl?: string;
  promoVideoUrl?: string;
  eventType: EventType;
  deliveryMode: DeliveryMode;
  difficulty: string;
  language: string;
  price: number;
  currency: string;
  capacity?: number;
  visibility: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
