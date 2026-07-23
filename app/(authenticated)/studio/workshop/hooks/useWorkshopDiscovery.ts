'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPublishedWorkshops, WorkshopSearchParams } from '../api/discoveryApi';
import { Workshop } from '../types';

export function useWorkshopDiscovery() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const loadWorkshops = useCallback(async (params?: WorkshopSearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPublishedWorkshops(params);
      let list = data?.content || [];

      // Filter by category if selected
      if (params?.category && params.category !== 'all') {
        list = list.filter(w => w.category?.toLowerCase() === params.category?.toLowerCase());
      }

      // Filter by type if selected
      if (params?.type && params.type !== 'all') {
        list = list.filter(w => w.workshopType === params.type);
      }

      setWorkshops(list);
    } catch (err: any) {
      console.error('Failed to load published workshops:', err);
      setError(err?.message || 'Failed to load workshops. Please try again.');
      setWorkshops([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWorkshops({
        search: searchQuery,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        type: selectedType !== 'all' ? selectedType : undefined
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedType, loadWorkshops]);

  return {
    workshops,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedType,
    setSelectedType,
    refetch: () => loadWorkshops({ search: searchQuery, category: selectedCategory, type: selectedType })
  };
}
