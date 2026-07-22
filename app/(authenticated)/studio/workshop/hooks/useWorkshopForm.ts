import { useState, useCallback, useMemo } from 'react';
import { DeliveryMode, Difficulty, Visibility, WorkshopFormData, WorkshopType } from '@/app/(authenticated)/studio/workshop/types';

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
  language: '',
  price: 0,
  currency: 'USD',
  capacity: undefined,
  visibility: Visibility.PRIVATE,
  sessions: [],
};

export const useWorkshopForm = () => {
  const [formData, setFormData] = useState<WorkshopFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
