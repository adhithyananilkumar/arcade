import React, { useState, useEffect } from 'react';
import { api } from '@/infrastructure/http/api';
import { SessionForm } from '@/app/(authenticated)/studio/workshop/components/wizard/schedule/SessionForm';
import { WorkshopSession } from '@/app/(authenticated)/studio/workshop/types';
import { X, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  workshopId: string;
  sessionId: string | null;
  onSaved?: () => void;
}

export const SessionSettingsDialog: React.FC<Props> = ({ open, onClose, workshopId, sessionId, onSaved }) => {
  const [session, setSession] = useState<Partial<WorkshopSession> | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && sessionId && workshopId) {
      setLoading(true);
      setError(null);
      // Fetch all sessions and find ours since there's no GET by ID endpoint currently
      api.get<WorkshopSession[]>(`/api/workshops/${workshopId}/sessions`)
        .then(sessions => {
          const s = sessions.find(x => x.id === sessionId);
          if (s) {
            setSession(s);
          } else {
            setError('Session not found.');
          }
        })
        .catch(err => setError(err.message || 'Failed to load session'))
        .finally(() => setLoading(false));
    } else {
      setSession(null);
    }
  }, [open, sessionId, workshopId]);

  const handleUpdate = (field: string, value: any) => {
    setSession(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSave = async () => {
    if (!sessionId || !session) return;
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/api/workshops/${workshopId}/sessions/${sessionId}`, session);
      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Day Schedule & Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex justify-center p-8 text-indigo-500">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          ) : session ? (
            <SessionForm session={session} onUpdate={handleUpdate} />
          ) : null}
        </div>

        <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !session}
            onClick={handleSave}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
