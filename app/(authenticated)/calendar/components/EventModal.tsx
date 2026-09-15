'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/design-system/ui/dialog';
import { Button } from '@/shared/design-system/ui/button';
import { Input } from '@/shared/design-system/ui/input';
import { Textarea } from '@/shared/design-system/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/design-system/ui/select';
import { CalendarEvent, CalendarCategory, useCreateEvent, useUpdateEvent, useDeleteEvent } from '../api/calendar';
import { format, parseISO } from 'date-fns';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date;
  eventToEdit: CalendarEvent | null;
  categories: CalendarCategory[];
}

export default function EventModal({ isOpen, onClose, initialDate, eventToEdit, categories }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');
  const [categoryId, setCategoryId] = useState<string>('none');
  const [reminderMinutes, setReminderMinutes] = useState<string>('-1');
  const [isDeleting, setIsDeleting] = useState(false);

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        setTitle(eventToEdit.title);
        setDescription(eventToEdit.description || '');
        const start = parseISO(eventToEdit.startTime);
        const end = parseISO(eventToEdit.endTime);
        setDateStr(format(start, 'yyyy-MM-dd'));
        setStartTimeStr(format(start, 'HH:mm'));
        setEndTimeStr(format(end, 'HH:mm'));
        setCategoryId(eventToEdit.category?.id || (categories.length > 0 ? categories[0].id : 'none'));
        setReminderMinutes(eventToEdit.reminderMinutes != null ? String(eventToEdit.reminderMinutes) : '-1');
      } else {
        setTitle('');
        setDescription('');
        setDateStr(format(initialDate, 'yyyy-MM-dd'));
        setStartTimeStr(format(initialDate, 'HH:mm'));
        const end = new Date(initialDate);
        end.setHours(initialDate.getHours() + 1);
        setEndTimeStr(format(end, 'HH:mm'));
        setCategoryId(categories.length > 0 ? categories[0].id : 'none');
        setReminderMinutes('-1');
      }
      setIsDeleting(false);
    }
  }, [isOpen, eventToEdit, initialDate]);

  const handleSave = async () => {
    if (!title.trim() || !dateStr || !startTimeStr || !endTimeStr || categoryId === 'none') return;

    // Combine date and time
    const startIso = new Date(`${dateStr}T${startTimeStr}`).toISOString();
    const endIso = new Date(`${dateStr}T${endTimeStr}`).toISOString();
    
    if (new Date(startIso) >= new Date(endIso)) {
        alert("End time must be after start time");
        return;
    }

    const payload = {
      title,
      description: description || undefined,
      startTime: startIso,
      endTime: endIso,
      categoryId: categoryId === 'none' ? undefined : categoryId,
      reminderMinutes: reminderMinutes === '-1' ? undefined : parseInt(reminderMinutes, 10),
    };

    if (eventToEdit) {
      await updateEvent.mutateAsync({ id: eventToEdit.id, data: payload });
    } else {
      await createEvent.mutateAsync(payload);
    }
    
    onClose();
  };

  const handleDelete = async () => {
    if (eventToEdit) {
      await deleteEvent.mutateAsync(eventToEdit.id);
      onClose();
    }
  };

  const isPending = createEvent.isPending || updateEvent.isPending || deleteEvent.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{eventToEdit ? 'Edit Event' : 'New Event'}</DialogTitle>
        </DialogHeader>
        
        {!isDeleting ? (
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Title *</label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Add title" autoFocus />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date *</label>
                        <Input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Start Time *</label>
                        <Input type="time" value={startTimeStr} onChange={e => setStartTimeStr(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">End Time *</label>
                        <Input type="time" value={endTimeStr} onChange={e => setEndTimeStr(e.target.value)} />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                        <label className="text-sm font-medium">Calendar</label>
                        <div className="relative">
                            <select 
                                value={categoryId} 
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="flex h-9 w-full appearance-none items-center justify-between whitespace-nowrap rounded-lg border border-input bg-transparent px-3 py-2 pr-8 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 cursor-pointer"
                            >
                                {categories.length === 0 && <option value="none">No Calendar</option>}
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground">
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.13523 6.15803C3.32588 5.95657 3.64211 5.94825 3.84357 6.13891L7.5 9.59972L11.1564 6.13891C11.3579 5.94825 11.6741 5.95657 11.8648 6.15803C12.0554 6.35949 12.0471 6.67572 11.8456 6.86638L7.84561 10.6521C7.65991 10.8279 7.34009 10.8279 7.15439 10.6521L3.15439 6.86638C2.95293 6.67572 2.9446 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 relative">
                        <label className="text-sm font-medium">Reminder</label>
                        <div className="relative">
                            <select 
                                value={reminderMinutes} 
                                onChange={(e) => setReminderMinutes(e.target.value)}
                                className="flex h-9 w-full appearance-none items-center justify-between whitespace-nowrap rounded-lg border border-input bg-transparent px-3 py-2 pr-8 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 cursor-pointer"
                            >
                                <option value="-1">No reminder</option>
                                <option value="0">At time of event</option>
                                <option value="5">5 minutes before</option>
                                <option value="10">10 minutes before</option>
                                <option value="15">15 minutes before</option>
                                <option value="30">30 minutes before</option>
                                <option value="60">1 hour before</option>
                                <option value="1440">1 day before</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground">
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.13523 6.15803C3.32588 5.95657 3.64211 5.94825 3.84357 6.13891L7.5 9.59972L11.1564 6.13891C11.3579 5.94825 11.6741 5.95657 11.8648 6.15803C12.0554 6.35949 12.0471 6.67572 11.8456 6.86638L7.84561 10.6521C7.65991 10.8279 7.34009 10.8279 7.15439 10.6521L3.15439 6.86638C2.95293 6.67572 2.9446 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        placeholder="Add description" 
                        className="resize-none h-20"
                    />
                </div>
            </div>
        ) : (
            <div className="py-6 text-center">
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Delete Event?</h3>
                <p className="text-sm text-neutral-500">Are you sure you want to delete "{eventToEdit?.title}"? This action cannot be undone.</p>
            </div>
        )}

        <DialogFooter className="flex items-center justify-between sm:justify-between">
            {eventToEdit && !isDeleting ? (
                <Button type="button" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setIsDeleting(true)}>
                    Delete
                </Button>
            ) : (
                <div />
            )}
            
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => isDeleting ? setIsDeleting(false) : onClose()}>
                    Cancel
                </Button>
                {isDeleting ? (
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
                        {isPending ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                ) : (
                    <Button type="button" onClick={handleSave} disabled={!title.trim() || categoryId === 'none' || isPending}>
                        {isPending ? 'Saving...' : 'Save'}
                    </Button>
                )}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
