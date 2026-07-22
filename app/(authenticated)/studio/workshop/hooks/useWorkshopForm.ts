import { useState, useCallback, useMemo, useEffect } from 'react';
import { DeliveryMode, Difficulty, Visibility, WorkshopFormData, WorkshopType, PricingModel, RegistrationType, SeatType, RefundPolicy, ListingStatus } from '@/app/(authenticated)/studio/workshop/types';

const initialData: WorkshopFormData = {
  title: '',
  subtitle: '',

  description: '',
  category: '',
  tags: [],
  thumbnailUrl: '',
  coverImageUrl: '',
  promoVideoUrl: '',
  workshopType: WorkshopType.WORKSHOP,
  deliveryMode: DeliveryMode.ONLINE,
  difficulty: Difficulty.BEGINNER,
  language: 'en',
  price: 0,
  currency: 'USD',
  capacity: undefined,
  visibility: Visibility.PRIVATE,
  sessions: [],
  pricing: {
    pricingModel: PricingModel.FREE,
    price: 0,
    currency: 'USD',
    registrationType: RegistrationType.OPEN,
    seatType: SeatType.UNLIMITED,
    waitlistEnabled: false,
    earlyBirdEnabled: false,
    couponEnabled: false,
    refundPolicy: RefundPolicy.NO_REFUND,
    allowCancellation: false
  },
  folders: [],
  resources: [],
  settings: {
    visibility: Visibility.PUBLIC,
    listingStatus: ListingStatus.LISTED,
    allowReviews: true,
    allowDiscussion: true,
    certificateEnabled: false,
    recordingAvailable: false,
    chatEnabled: true,
    enableReminders: true,
    emailNotifications: true,
    mobileNotifications: false,
    calendarIntegration: true,
    autoPublish: false,
    customUrlEnabled: false
  }
};

export const useWorkshopForm = () => {
  const [formData, setFormData] = useState<WorkshopFormData>(() => {
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem('arcade_workshop_draft');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          return {
            ...initialData,
            ...parsed,
            pricing: { ...initialData.pricing, ...(parsed.pricing || {}) },
            settings: { ...initialData.settings, ...(parsed.settings || {}) }
          };
        } catch (e) {
          console.error('Failed to parse saved draft', e);
        }
      }
    }
    return initialData;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('arcade_workshop_draft', JSON.stringify(formData));
    }
  }, [formData]);

  const validateField = useCallback((name: string, value: any) => {
    let error = '';
    switch (name) {
      case 'title':
        if (!value) error = 'Title is required';
        else if (value.length < 5 || value.length > 120) error = 'Title must be between 5 and 120 characters';
        break;

      case 'category':
        if (!value) error = 'Category is required';
        break;
      case 'language':
        if (!value) error = 'Language is required';
        break;
      case 'price':
        if (value < 0) error = 'Price cannot be negative';
        break;
      case 'capacity':
        if (value !== undefined && value !== '' && (!Number.isInteger(Number(value)) || Number(value) < 1)) {
          error = 'Capacity must be a positive integer';
        }
        break;
    }
    return error;
  }, []);

  const handleChange = useCallback((name: keyof WorkshopFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  }, [validateField]);

  const isValid = useMemo(() => {
    const requiredFields: (keyof WorkshopFormData)[] = ['title', 'category', 'language'];
    const hasMissingFields = requiredFields.some(field => !formData[field]);
    return !hasMissingFields && Object.keys(errors).length === 0;
  }, [formData, errors]);

  return {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    isValid,
  };
};
