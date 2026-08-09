'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPublishedEvents, EventSearchParams } from '../api/discoveryApi';
import { Event } from '../types';

export function useEventDiscovery(options?: { types?: string[] }) {
  const [workshops, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const loadEvents = useCallback(async (params?: EventSearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPublishedEvents(params);
      let list = data?.content || [];

      // Filter by category if selected
      if (params?.category && params.category !== 'all') {
        list = list.filter(w => w.category?.toLowerCase() === params.category?.toLowerCase());
      }

      // Filter by type if selected
      if (params?.type && params.type !== 'all') {
        list = list.filter(w => w.eventType === params.type);
      } else if (params?.types && params.types.length > 0) {
        list = list.filter(w => params.types?.includes(w.eventType as string));
      }

      setEvents(list);
    } catch (err: any) {
      console.error('Failed to load published workshops:', err);
      setError(err?.message || 'Failed to load workshops. Please try again.');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents({
        search: searchQuery,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        types: options?.types
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedType, options?.types, loadEvents]);

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
    refetch: () => loadEvents({ search: searchQuery, category: selectedCategory, type: selectedType, types: options?.types })
  };
}
