import { WorkshopType, DeliveryMode, Difficulty, Visibility } from '@/app/(authenticated)/studio/workshop/types';

export const WORKSHOP_TYPES = [
  { value: WorkshopType.WORKSHOP, label: 'Workshop' },
  { value: WorkshopType.BOOTCAMP, label: 'Bootcamp' },
  { value: WorkshopType.MASTERCLASS, label: 'Masterclass' },
  { value: WorkshopType.WEBINAR, label: 'Webinar' },
  { value: WorkshopType.AMA, label: 'AMA' },
];

export const DELIVERY_MODES = [
  { value: DeliveryMode.ONLINE, label: 'Online' },
  { value: DeliveryMode.OFFLINE, label: 'Offline' },
  { value: DeliveryMode.HYBRID, label: 'Hybrid' },
  { value: DeliveryMode.RECORDED, label: 'Recorded' },
];

export const DIFFICULTIES = [
  { value: Difficulty.BEGINNER, label: 'Beginner' },
  { value: Difficulty.INTERMEDIATE, label: 'Intermediate' },
  { value: Difficulty.ADVANCED, label: 'Advanced' },
];

export const VISIBILITIES = [
  { value: Visibility.PUBLIC, label: 'Public' },
  { value: Visibility.PRIVATE, label: 'Private' },
  { value: Visibility.UNLISTED, label: 'Unlisted' },
];

// Placeholder lists
export const CATEGORIES = [
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'business', label: 'Business' },
];

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
];
