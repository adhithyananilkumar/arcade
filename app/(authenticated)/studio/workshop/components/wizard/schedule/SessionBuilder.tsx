import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useWorkshopForm } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopForm';
import { SessionCard } from './SessionCard';

interface Props {
  form: ReturnType<typeof useWorkshopForm>;
}

export const SessionBuilder: React.FC<Props> = ({ form }) => {
  const sessions = form.formData.sessions || [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sessions.findIndex((_, index) => `session-${index}` === active.id);
      const newIndex = sessions.findIndex((_, index) => `session-${index}` === over.id);

      const newSessions = arrayMove(sessions, oldIndex, newIndex);
      form.handleChange('sessions', newSessions);
    }
  };

  const updateSession = (index: number, field: string, value: any) => {
    const newSessions = [...sessions];
    newSessions[index] = { ...newSessions[index], [field]: value };
    form.handleChange('sessions', newSessions);
  };

  const deleteSession = (index: number) => {
    const newSessions = sessions.filter((_, i) => i !== index);
    form.handleChange('sessions', newSessions);
  };

  const duplicateSession = (index: number) => {
    const sessionToDuplicate = sessions[index];
    const newSessions = [...sessions];
    newSessions.splice(index + 1, 0, { ...sessionToDuplicate, title: `${sessionToDuplicate.title} (Copy)` });
    form.handleChange('sessions', newSessions);
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No sessions scheduled yet. Click 'Add Session' to begin.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sessions.map((_, i) => `session-${i}`)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <SessionCard
              key={`session-${index}`}
              id={`session-${index}`}
              session={session}
              index={index}
              onUpdate={(field, value) => updateSession(index, field, value)}
              onDelete={() => deleteSession(index)}
              onDuplicate={() => duplicateSession(index)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
