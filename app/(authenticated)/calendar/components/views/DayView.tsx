'use client';

import React, { useRef, useEffect } from 'react';
import { format, isSameDay, parseISO, differenceInMinutes, getHours } from 'date-fns';
import { CalendarEvent } from '../../api/calendar';

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  onEmptySlotClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function DayView({ date, events, onEmptySlotClick, onEventClick }: DayViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = events.filter(e => isSameDay(parseISO(e.startTime), date));

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = 8 * 60; // 60px per hour
    }
  }, []);

  const getEventStyle = (event: CalendarEvent) => {
    const start = parseISO(event.startTime);
    const end = parseISO(event.endTime);
    
    const top = (getHours(start) * 60) + start.getMinutes();
    const duration = differenceInMinutes(end, start);
    const height = Math.max(duration, 30);

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  const getColorTheme = (colorName: string) => {
    const themes: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      teal: 'bg-teal-100 text-teal-700 border-teal-200',
      pink: 'bg-pink-100 text-pink-700 border-pink-200'
    };
    return themes[colorName.toLowerCase()] || themes.blue;
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="flex relative h-[1440px]"> {/* 24 hours * 60px */}
          {/* Time column */}
          <div className="w-20 flex-none border-r border-neutral-100 bg-white z-10 sticky left-0 pt-2">
            {hours.map(hour => (
              <div key={hour} className="h-[60px] text-right pr-4 relative -top-3">
                <span className="text-xs text-neutral-400 font-medium">
                  {hour === 0 ? '' : format(new Date().setHours(hour, 0), 'h:mm a')}
                </span>
              </div>
            ))}
          </div>
          
          {/* Day column */}
          <div className="relative flex-1 min-w-0">
            {/* Grid lines */}
            {hours.map(hour => (
              <div 
                  key={hour} 
                  className="h-[60px] border-b border-neutral-100 hover:bg-neutral-50/50 cursor-pointer transition-colors"
                  onClick={() => {
                      const newDate = new Date(date);
                      newDate.setHours(hour, 0, 0, 0);
                      onEmptySlotClick(newDate);
                  }}
              />
            ))}
            
            {/* Events */}
            {dayEvents.map(event => {
                const theme = getColorTheme(event.category?.color || 'blue');
                return (
                  <div 
                    key={event.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                    className={`absolute left-2 right-4 cursor-pointer overflow-hidden rounded-lg border p-3 shadow-sm transition-transform hover:-translate-y-0.5 z-20 ${theme}`}
                    style={getEventStyle(event)}
                  >
                      <div className="text-sm font-semibold truncate">{event.title}</div>
                      <div className="text-xs opacity-80 mt-1 flex items-center gap-2">
                          <span>{format(parseISO(event.startTime), 'h:mm a')} - {format(parseISO(event.endTime), 'h:mm a')}</span>
                          {event.category && (
                              <>
                                <span>•</span>
                                <span>{event.category.name}</span>
                              </>
                          )}
                      </div>
                      {event.description && (
                          <div className="text-xs mt-2 opacity-90 line-clamp-2">{event.description}</div>
                      )}
                  </div>
                )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
