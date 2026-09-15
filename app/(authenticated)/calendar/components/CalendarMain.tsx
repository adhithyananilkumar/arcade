'use client';

import React, { useState } from 'react';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CalendarEvent, CalendarCategory } from '../api/calendar';
import WeekView from './views/WeekView';
import MonthView from './views/MonthView';
import DayView from './views/DayView';
import EventModal from './EventModal';
import { Button } from '@/shared/design-system/ui/button';

interface CalendarMainProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  currentView: 'Day' | 'Week' | 'Month';
  onViewChange: (view: 'Day' | 'Week' | 'Month') => void;
  events: CalendarEvent[];
  categories: CalendarCategory[];
  isLoading: boolean;
}

export default function CalendarMain({
  selectedDate,
  onSelectDate,
  currentView,
  onViewChange,
  events,
  categories,
  isLoading
}: CalendarMainProps) {
  
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEventToEdit, setSelectedEventToEdit] = useState<CalendarEvent | null>(null);
  const [initialSlotDate, setInitialSlotDate] = useState<Date>(selectedDate);

  const handlePrevious = () => {
    if (currentView === 'Day') onSelectDate(subDays(selectedDate, 1));
    if (currentView === 'Week') onSelectDate(subWeeks(selectedDate, 1));
    if (currentView === 'Month') onSelectDate(subMonths(selectedDate, 1));
  };

  const handleNext = () => {
    if (currentView === 'Day') onSelectDate(addDays(selectedDate, 1));
    if (currentView === 'Week') onSelectDate(addWeeks(selectedDate, 1));
    if (currentView === 'Month') onSelectDate(addMonths(selectedDate, 1));
  };

  const handleToday = () => {
    onSelectDate(new Date());
  };

  const handleEmptySlotClick = (date: Date) => {
    setInitialSlotDate(date);
    setSelectedEventToEdit(null);
    setIsEventModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEventToEdit(event);
    setIsEventModalOpen(true);
  };

  return (
    <div className="flex flex-1 min-h-0 min-w-0 flex-col bg-white relative">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0 px-6 py-4 border-b border-neutral-200">
        <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
                {currentView === 'Day' && format(selectedDate, 'MMMM d, yyyy')}
                {currentView === 'Week' && format(selectedDate, 'MMMM yyyy')}
                {currentView === 'Month' && format(selectedDate, 'MMMM yyyy')}
            </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={handleToday} className="rounded-lg px-4 h-9 font-medium shadow-sm">
              Today
            </Button>
            <div className="flex items-center gap-0.5 rounded-lg border border-neutral-200 p-0.5 shadow-sm bg-white">
              <button onClick={handlePrevious} className="rounded-md p-1.5 hover:bg-neutral-100 transition-colors text-neutral-600">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={handleNext} className="rounded-md p-1.5 hover:bg-neutral-100 transition-colors text-neutral-600">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex rounded-lg border border-neutral-200 bg-neutral-100/50 p-1 shadow-inner">
            {['Day', 'Week', 'Month'].map(view => (
              <button
                key={view}
                onClick={() => onViewChange(view as any)}
                className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                  currentView === view
                    ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/50'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
          
          <Button 
            onClick={() => {
                setInitialSlotDate(selectedDate);
                setSelectedEventToEdit(null);
                setIsEventModalOpen(true);
            }} 
            className="rounded-lg gap-2 hidden md:flex h-9 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'Day' && (
          <DayView date={selectedDate} events={events} onEmptySlotClick={handleEmptySlotClick} onEventClick={handleEventClick} />
        )}
        {currentView === 'Week' && (
          <WeekView date={selectedDate} events={events} onEmptySlotClick={handleEmptySlotClick} onEventClick={handleEventClick} />
        )}
        {currentView === 'Month' && (
          <MonthView date={selectedDate} events={events} onDateClick={onSelectDate} onEventClick={handleEventClick} onEmptySlotClick={handleEmptySlotClick} />
        )}
      </div>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        initialDate={initialSlotDate}
        eventToEdit={selectedEventToEdit}
        categories={categories}
      />
    </div>
  );
}
