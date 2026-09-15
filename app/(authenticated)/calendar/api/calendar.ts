'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/infrastructure/http/api';
import { formatISO } from 'date-fns';

export interface CalendarCategory {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

export interface CalendarEvent {
  id: string;
  courseId: string | null;
  title: string;
  description: string | null;
  startTime: string; // ISO string
  endTime: string; // ISO string
  category: CalendarCategory | null;
  reminderMinutes: number | null;
  isCompleted: boolean;
}

export interface CalendarEventRequest {
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  categoryId?: string;
  reminderMinutes?: number;
}

export interface CalendarCategoryRequest {
  name: string;
  color: string;
}

export const calendarKeys = {
  all: ['calendar'] as const,
  events: (start: string, end: string) => [...calendarKeys.all, 'events', start, end] as const,
  categories: () => [...calendarKeys.all, 'categories'] as const,
};

export function useCalendarCategories() {
  return useQuery({
    queryKey: calendarKeys.categories(),
    queryFn: () => api.get<CalendarCategory[]>('/api/calendar/categories'),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CalendarCategoryRequest) => api.post<CalendarCategory>('/api/calendar/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.categories() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/calendar/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.categories() });
    },
  });
}

export function useCalendarEvents(startDate: Date, endDate: Date) {
  const start = formatISO(startDate);
  const end = formatISO(endDate);

  return useQuery({
    queryKey: calendarKeys.events(start, end),
    queryFn: () => api.get<CalendarEvent[]>(`/api/calendar/events?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CalendarEventRequest) => api.post<CalendarEvent>('/api/calendar/events', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CalendarEventRequest }) => api.patch<CalendarEvent>(`/api/calendar/events/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/calendar/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all });
    },
  });
}
