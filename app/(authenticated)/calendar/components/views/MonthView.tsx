'use client';

import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarEvent } from '../../api/calendar';

interface MonthViewProps {
  date: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEmptySlotClick?: (date: Date) => void;
}

export default function MonthView({ date, events, onDateClick, onEventClick, onEmptySlotClick }: MonthViewProps) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getColorTheme = (colorName: string) => {
    const themes: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700',
      purple: 'bg-purple-100 text-purple-700',
      green: 'bg-green-100 text-green-700',
      red: 'bg-red-100 text-red-700',
      orange: 'bg-orange-100 text-orange-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      teal: 'bg-teal-100 text-teal-700',
      pink: 'bg-pink-100 text-pink-700'
    };
    return themes[colorName.toLowerCase()] || themes.blue;
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-neutral-200 bg-white">
        {weekDays.map((day, i) => (
          <div key={i} className="py-3 text-center text-xs font-semibold text-neutral-400 uppercase tracking-wider border-r border-neutral-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      
      {/* Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-white border-l-0 border-t-0 divide-x divide-y divide-neutral-200">
        {days.map((day, i) => {
          const dayEvents = events.filter(e => isSameDay(parseISO(e.startTime), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isSelected = isSameDay(day, date);
          const isCurrentDay = isSameDay(day, new Date());
          
          return (
            <div 
              key={i} 
              onClick={() => {
                onDateClick(day);
                if (onEmptySlotClick) onEmptySlotClick(day);
              }}
              className={`min-h-0 bg-white p-2 cursor-pointer transition-all duration-200 hover:bg-slate-50 flex flex-col group ${!isCurrentMonth ? 'opacity-40 bg-neutral-50/50' : ''}`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className={`flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full text-xs md:text-sm font-medium transition-colors ${
                    isCurrentDay 
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20' 
                      : isSelected 
                        ? 'bg-neutral-100 text-neutral-900 font-semibold' 
                        : 'text-neutral-600 group-hover:text-blue-600'
                }`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar flex flex-col items-stretch">
                  {dayEvents.slice(0, 3).map(event => (
                      <div 
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                        className={`truncate rounded-md px-1.5 py-0.5 text-[10px] md:text-xs font-medium cursor-pointer transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm border border-transparent hover:border-black/5 ${getColorTheme(event.category?.color || 'blue')}`}
                        title={event.title}
                      >
                          {event.title}
                      </div>
                  ))}
                  {dayEvents.length > 3 && (
                      <div className="text-[10px] text-neutral-400 font-medium pl-1 mt-0.5 hover:text-neutral-600 transition-colors">
                          + {dayEvents.length - 3} more
                      </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
