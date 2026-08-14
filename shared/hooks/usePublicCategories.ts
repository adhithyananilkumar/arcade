'use client';

import { useEffect, useState } from 'react';
import { api } from '@/infrastructure/http/api';

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  type: 'COURSES' | 'EVENTS' | 'ARTICLES';
  displayOrder: number;
  active: boolean;
}

/** Active categories created via Console -> Content Manage -> Categories (super-user only). */
export function usePublicCategories(): PublicCategory[] {
  const [categories, setCategories] = useState<PublicCategory[]>([]);

  useEffect(() => {
    api
      .get<PublicCategory[]>('/api/v1/public/categories')
      .then(setCategories)
      .catch(() => {
        // Silently ignore — the hardcoded dummy categories still render fine on their own.
      });
  }, []);

  return categories;
}
