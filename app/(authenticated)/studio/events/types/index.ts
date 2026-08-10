export enum EventStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
  ARCHIVED = 'ARCHIVED',
  COMPLETED = 'COMPLETED'
}

export enum EventType {
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
  DRAFT_ONLY = 'DRAFT_ONLY'
}

export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  description?: string;
  status: EventStatus;
  category: string;
  tags?: string[];
  thumbnailUrl?: string;
  coverImageUrl?: string;
  promoVideoUrl?: string;
  eventType: EventType;
  meetingUrl?: string;
  deliveryMode: DeliveryMode;
  difficulty: Difficulty;
  language: string;
  /** Minor currency units (e.g. cents/paise). */
  priceAmount: number;
  currency: string;
  capacity?: number;
  visibility: Visibility;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateEventRequest = Omit<Event, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'status'>;

export interface EventFormData extends Partial<CreateEventRequest> {
  title: string;
  category: string;
  language: string;
  sessions: Partial<EventSession>[];
  pricing: Partial<EventPricing>;
  folders: Partial<EventFolder>[];
  resources: Partial<EventResource>[];
  settings: Partial<EventSettings>;
}

export enum SessionStatus {
  PLANNED = 'PLANNED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED'
}

export enum SessionReleaseType {
  IMMEDIATE = 'IMMEDIATE',
  SCHEDULED_START = 'SCHEDULED_START',
  SCHEDULED_END = 'SCHEDULED_END',
  MANUAL = 'MANUAL',
  CUSTOM = 'CUSTOM'
}

export enum MeetingProvider {
  NONE = 'NONE',
  ZOOM = 'ZOOM',
  GOOGLE_MEET = 'GOOGLE_MEET',
  MICROSOFT_TEAMS = 'MICROSOFT_TEAMS',
  JITSI = 'JITSI',
  CUSTOM = 'CUSTOM'
}

export interface EventLesson {
  id: string;
  sessionId: string;
  title: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventSession {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  sessionNumber: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM:SS
  endTime: string; // HH:MM:SS
  timezone: string;
  deliveryMode: DeliveryMode;
  locationDetails?: Record<string, string>;
  meetingUrl?: string;
  meetingProvider?: MeetingProvider;
  capacity?: number;
  status: SessionStatus;
  releaseType?: SessionReleaseType;
  customReleaseTime?: string;
  isManuallyReleased?: boolean;
  createdAt: string;
  updatedAt: string;
  lessons?: EventLesson[];
}

export type CreateEventSessionRequest = Omit<EventSession, 'id' | 'eventId' | 'sessionNumber' | 'status' | 'isManuallyReleased' | 'createdAt' | 'updatedAt' | 'lessons'>;
export type UpdateEventSessionRequest = Partial<CreateEventSessionRequest> & { status?: SessionStatus };


export enum PricingModel {
  FREE = 'FREE',
  PAID = 'PAID',
  MEMBERSHIP = 'MEMBERSHIP',
  INVITE_ONLY = 'INVITE_ONLY',
  COMING_SOON = 'COMING_SOON'
}

export enum RegistrationType {
  OPEN = 'OPEN',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',
  INVITE_ONLY = 'INVITE_ONLY',
  PRIVATE = 'PRIVATE'
}

export enum SeatType {
  UNLIMITED = 'UNLIMITED',
  LIMITED = 'LIMITED'
}

export enum RefundPolicy {
  NO_REFUND = 'NO_REFUND',
  FULL_REFUND = 'FULL_REFUND',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
  CUSTOM = 'CUSTOM'
}

export interface EventPricing {
  id: string;
  eventId: string;
  pricingModel: PricingModel;
  price: number;
  currency: string;
  registrationType: RegistrationType;
  seatType: SeatType;
  seatLimit?: number;
  waitlistEnabled: boolean;
  registrationStart?: string; // ISO OffsetDateTime
  registrationEnd?: string;
  earlyBirdEnabled: boolean;
  earlyBirdPrice?: number;
  earlyBirdEndDate?: string;
  couponEnabled: boolean;
  refundPolicy?: RefundPolicy;
  allowCancellation: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SaveEventPricingRequest = Omit<EventPricing, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>;

export enum ListingStatus {
  LISTED = 'LISTED',
  UNLISTED = 'UNLISTED',
  FEATURED = 'FEATURED'
}

export enum RecordingVisibility {
  REGISTERED_ONLY = 'REGISTERED_ONLY',
  PUBLIC = 'PUBLIC',
  INSTRUCTOR_ONLY = 'INSTRUCTOR_ONLY'
}

export interface EventSettings {
  id: string;
  eventId: string;
  visibility: Visibility;
  listingStatus: ListingStatus;
  allowReviews: boolean;
  allowDiscussion: boolean;
  certificateEnabled: boolean;
  recordingAvailable: boolean;
  recordingVisibility?: RecordingVisibility;
  chatEnabled: boolean;
  enableReminders: boolean;
  emailNotifications: boolean;
  mobileNotifications: boolean;
  calendarIntegration: boolean;
  autoPublish: boolean;
  customUrlEnabled: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: string;
  updatedAt: string;
}

export type SaveEventSettingsRequest = Omit<EventSettings, 'id' | 'eventId' | 'createdAt' | 'updatedAt'>;

export interface ValidationIssue {
  section: string;
  issue: string;
  resolutionAction: string;
}

export interface PublishValidationResponse {
  isReady: boolean;
  completionPercentage: number;
  issues: ValidationIssue[];
}

export interface EventPreviewDto {
  basicInfo: Event;
  schedule: EventSession[];
  resources: EventResource[];
  pricing: EventPricing;
  settings: EventSettings;
}

export enum ResourceType {
  PDF = 'PDF',
  DOCUMENT = 'DOCUMENT',
  SLIDES = 'SLIDES',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  ZIP = 'ZIP',
  CODE = 'CODE',
  TEMPLATE = 'TEMPLATE',
  LINK = 'LINK',
  MARKDOWN = 'MARKDOWN',
  OTHER = 'OTHER'
}

export enum StorageProvider {
  LOCAL = 'LOCAL',
  S3 = 'S3',
  AZURE = 'AZURE',
  GOOGLE_CLOUD = 'GOOGLE_CLOUD',
  EXTERNAL = 'EXTERNAL'
}

export interface EventFolder {
  id: string;
  eventId: string;
  name: string;
  parentFolderId?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventResource {
  id: string;
  eventId: string;
  folderId?: string;
  title: string;
  description?: string;
  resourceType: ResourceType;
  fileName?: string;
  originalFileName?: string;
  mimeType?: string;
  fileSize?: number;
  fileUrl?: string;
  thumbnailUrl?: string;
  externalUrl?: string;
  storageProvider: StorageProvider;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
