import { EventType, DeliveryMode, Difficulty, Visibility } from '@/app/(authenticated)/studio/events/types';

export const WORKSHOP_TYPES = [
  { value: EventType.WORKSHOP, label: 'Event' },
  { value: EventType.BOOTCAMP, label: 'Bootcamp' },
  { value: EventType.MASTERCLASS, label: 'Masterclass' },
  { value: EventType.WEBINAR, label: 'Webinar' },
  { value: EventType.AMA, label: 'AMA' },
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
