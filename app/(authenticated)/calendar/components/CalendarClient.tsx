'use client';

import React, { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import CalendarSidebar from './CalendarSidebar';
import CalendarMain from './CalendarMain';
import { useCalendarCategories, useCalendarEvents } from '../api/calendar';

export default function CalendarClient() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  
  const initialDate = dateParam ? new Date(dateParam) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [currentView, setCurrentView] = useState<'Day' | 'Week' | 'Month'>('Week');
  
  // Define fetching range based on selected date +/- a buffer to avoid frequent re-fetches
  // For simplicity, fetch the whole month surrounding the selected date
  const [fetchRange, setFetchRange] = useState({
      start: startOfMonth(subMonths(initialDate, 1)),
      end: endOfMonth(addMonths(initialDate, 1))
  });
  
  // Update fetch range if selected date goes out of bounds
  useEffect(() => {
      if (selectedDate < fetchRange.start || selectedDate > fetchRange.end) {
          setFetchRange({
              start: startOfMonth(subMonths(selectedDate, 1)),
              end: endOfMonth(addMonths(selectedDate, 1))
          });
      }
  }, [selectedDate, fetchRange]);

  const { data: categories, isLoading: isLoadingCategories } = useCalendarCategories();
  const { data: events, isLoading: isLoadingEvents } = useCalendarEvents(fetchRange.start, fetchRange.end);
  
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
      setHiddenCategories(prev => {
          const next = new Set(prev);
          if (next.has(categoryId)) {
              next.delete(categoryId);
          } else {
              next.add(categoryId);
          }
          return next;
      });
  };

  const visibleEvents = React.useMemo(() => {
      if (!events) return [];
      return events.filter(e => e.category ? !hiddenCategories.has(e.category.id) : true);
  }, [events, hiddenCategories]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col lg:flex-row bg-white rounded-[2rem] border border-neutral-200 shadow-sm overflow-hidden">
      <CalendarSidebar 
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          categories={categories || []}
          hiddenCategories={hiddenCategories}
          onToggleCategory={toggleCategory}
          isLoading={isLoadingCategories}
      />
      <CalendarMain 
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          currentView={currentView}
          onViewChange={setCurrentView}
          events={visibleEvents}
          categories={categories || []}
          isLoading={isLoadingEvents}
      />
    </div>
  );
}
