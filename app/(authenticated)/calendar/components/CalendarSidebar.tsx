'use client';

import React, { useState } from 'react';
import { CalendarCategory, useCreateCategory, useDeleteCategory } from '../api/calendar';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Check, Trash2 } from 'lucide-react';
import { Button } from '@/shared/design-system/ui/button';
import { Skeleton } from '@/shared/design-system/ui/skeleton';
import { Input } from '@/shared/design-system/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/design-system/ui/dialog';

interface CalendarSidebarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  categories: CalendarCategory[];
  hiddenCategories: Set<string>;
  onToggleCategory: (categoryId: string) => void;
  isLoading: boolean;
}

export default function CalendarSidebar({
  selectedDate,
  onSelectDate,
  categories,
  hiddenCategories,
  onToggleCategory,
  isLoading
}: CalendarSidebarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('blue');
  
  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    await createCategoryMutation.mutateAsync({ name: newCategoryName, color: newCategoryColor });
    setNewCategoryName('');
    setIsAddCategoryOpen(false);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="flex h-full min-h-0 w-full flex-col lg:w-[280px] lg:shrink-0 bg-slate-50/50 lg:border-r border-neutral-200">
      {/* Mini Calendar */}
      <div className="p-6 shrink-0 lg:border-b border-neutral-200/60">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-neutral-900">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="rounded p-1 hover:bg-neutral-200 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={nextMonth} className="rounded p-1 hover:bg-neutral-200 transition-colors"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-3">
          {weekDays.map((day, i) => (
            <div key={i} className="font-semibold text-neutral-400">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-[13px]">
          {days.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            
            return (
              <button
                key={i}
                onClick={() => {
                  onSelectDate(day);
                  setCurrentMonth(startOfMonth(day));
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-600 text-white font-medium shadow-sm ring-2 ring-blue-600/20' 
                    : isCurrentMonth
                      ? 'text-neutral-700 hover:bg-neutral-200/60'
                      : 'text-neutral-300 hover:text-neutral-500'
                }`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="p-6 pt-5 flex-1 min-h-0 flex flex-col">
        <div className="mb-4 flex items-center justify-between shrink-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">My calendars</h3>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
             <Skeleton className="h-5 w-full" />
             <Skeleton className="h-5 w-3/4" />
             <Skeleton className="h-5 w-4/5" />
          </div>
        ) : (
          <div className="space-y-1 overflow-y-auto pr-1 no-scrollbar flex-1">
            {categories.map(category => {
              const isHidden = hiddenCategories.has(category.id);
              return (
                <div key={category.id} className="flex items-center gap-2 w-full group rounded-md transition-colors hover:bg-neutral-50 px-2 py-1.5 -mx-2">
                  <button 
                    onClick={() => onToggleCategory(category.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded-sm transition-all duration-200 ${isHidden ? 'border-2 border-neutral-300 bg-transparent' : 'text-white border-transparent'}`} style={!isHidden ? { backgroundColor: getColorHex(category.color) } : {}}>
                      {!isHidden && <Check className="h-3 w-3" strokeWidth={3} />}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${isHidden ? 'text-neutral-400' : 'text-neutral-700'} truncate`}>{category.name}</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete the "${category.name}" calendar?`)) {
                        deleteCategoryMutation.mutate(category.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-md"
                    title="Delete calendar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            
            <button 
              onClick={() => setIsAddCategoryOpen(true)}
              className="mt-2 pt-2 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors w-full shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add calendar</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Calendar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Calendar Name</label>
              <Input 
                value={newCategoryName} 
                onChange={e => setNewCategoryName(e.target.value)} 
                placeholder="e.g. Work, Gym, Birthdays" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2 flex-wrap">
                {['blue', 'purple', 'green', 'red', 'orange', 'yellow', 'teal', 'pink'].map(c => (
                  <button 
                    key={c}
                    onClick={() => setNewCategoryColor(c)}
                    className={`h-8 w-8 rounded-full ${newCategoryColor === c ? 'ring-2 ring-offset-2 ring-neutral-400' : ''}`}
                    style={{ backgroundColor: getColorHex(c) }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim() || createCategoryMutation.isPending}>
              {createCategoryMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Utility to convert color names to hex for UI
function getColorHex(color: string) {
  const map: Record<string, string> = {
    blue: '#3b82f6',
    purple: '#a855f7',
    green: '#22c55e',
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#eab308',
    teal: '#14b8a6',
    pink: '#ec4899'
  };
  return map[color.toLowerCase()] || map.blue;
}
