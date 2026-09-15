'use client';

import React, { useRef, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, differenceInMinutes, startOfDay, getHours } from 'date-fns';
import { CalendarEvent } from '../../api/calendar';

interface WeekViewProps {
  date: Date;
  events: CalendarEvent[];
  onEmptySlotClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function WeekView({ date, events, onEmptySlotClick, onEventClick }: WeekViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  const days = eachDayOfInterval({ start, end });
  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    // Scroll to 8 AM by default
    if (scrollRef.current) {
        scrollRef.current.scrollTop = 8 * 60; // 60px per hour
    }
  }, []);

  const getEventStyle = (event: CalendarEvent) => {
    const start = parseISO(event.startTime);
    const end = parseISO(event.endTime);
    
    const top = (getHours(start) * 60) + start.getMinutes();
    const duration = differenceInMinutes(end, start);
    const height = Math.max(duration, 30); // minimum 30px height

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
      {/* Header */}
      <div className="flex border-b border-neutral-100 pl-16">
        {days.map((day, i) => (
          <div key={i} className="flex-1 pb-4 text-center">
            <div className="text-sm text-neutral-500 font-medium">{format(day, 'EEE')}</div>
            <div className={`mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold ${isSameDay(day, date) ? 'bg-blue-600 text-white' : 'text-neutral-900'}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      {/* Grid */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="flex relative h-[1440px]"> {/* 24 hours * 60px */}
          {/* Time column */}
          <div className="w-16 flex-none border-r border-neutral-100 bg-white z-10 sticky left-0 pt-2">
            {hours.map(hour => (
              <div key={hour} className="h-[60px] text-right pr-3 relative -top-3">
                <span className="text-xs text-neutral-400 font-medium">
                  {hour === 0 ? '' : format(new Date().setHours(hour, 0), 'h:mm a')}
                </span>
              </div>
            ))}
          </div>
          
          {/* Days columns */}
          <div className="flex flex-1">
            {days.map((day, dayIdx) => {
              const dayEvents = events.filter(e => isSameDay(parseISO(e.startTime), day));
              
              return (
                <div key={dayIdx} className="relative flex-1 border-r border-neutral-100 min-w-0">
                  {/* Grid lines */}
                  {hours.map(hour => (
                    <div 
                        key={hour} 
                        className="h-[60px] border-b border-neutral-100 hover:bg-neutral-50/50 cursor-pointer transition-colors"
                        onClick={() => {
                            const newDate = new Date(day);
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
                          className={`absolute left-1 right-1 cursor-pointer overflow-hidden rounded-md border p-1.5 shadow-sm transition-transform hover:-translate-y-0.5 z-20 ${theme}`}
                          style={getEventStyle(event)}
                        >
                            <div className="text-xs font-semibold truncate leading-tight">{event.title}</div>
                            <div className="text-[10px] opacity-80 mt-0.5">
                                {format(parseISO(event.startTime), 'h:mm a')} - {format(parseISO(event.endTime), 'h:mm a')}
                            </div>
                        </div>
                      )
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
