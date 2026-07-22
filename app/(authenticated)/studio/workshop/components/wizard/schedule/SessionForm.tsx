import React from 'react';
import { WorkshopSession, MeetingProvider } from '@/app/(authenticated)/studio/workshop/types';

interface Props {
  session: Partial<WorkshopSession>;
  onUpdate: (field: string, value: any) => void;
}

export const SessionForm: React.FC<Props> = ({ session, onUpdate }) => {
  const isOnline = session.deliveryMode === 'ONLINE' || session.deliveryMode === 'HYBRID';
  const isOffline = session.deliveryMode === 'OFFLINE' || session.deliveryMode === 'HYBRID';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
          <input
            type="text"
            value={session.title || ''}
            onChange={(e) => onUpdate('title', e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <textarea
            value={session.description || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Date *</label>
          <input
            type="date"
            value={session.startDate || ''}
            onChange={(e) => onUpdate('startDate', e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Date *</label>
          <input
            type="date"
            value={session.endDate || ''}
            onChange={(e) => onUpdate('endDate', e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Time *</label>
          <input
            type="time"
            value={session.startTime || ''}
            onChange={(e) => onUpdate('startTime', e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Time *</label>
          <input
            type="time"
            value={session.endTime || ''}
            onChange={(e) => onUpdate('endTime', e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
          />
        </div>
      </div>

      {isOnline && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-md border border-indigo-100 dark:border-indigo-800 space-y-4">
          <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Online Meeting Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Provider</label>
              <select
                value={session.meetingProvider || 'NONE'}
                onChange={(e) => onUpdate('meetingProvider', e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
              >
                {Object.keys(MeetingProvider).map((p) => (
                  <option key={p} value={p}>{p.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Meeting URL</label>
              <input
                type="url"
                value={session.meetingUrl || ''}
                onChange={(e) => onUpdate('meetingUrl', e.target.value)}
                placeholder="https://"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {isOffline && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-md border border-emerald-100 dark:border-emerald-800 space-y-4">
          <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Offline Location Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Venue</label>
              <input
                type="text"
                value={session.locationDetails?.venue || ''}
                onChange={(e) => onUpdate('locationDetails', { ...session.locationDetails, venue: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Address</label>
              <input
                type="text"
                value={session.locationDetails?.address || ''}
                onChange={(e) => onUpdate('locationDetails', { ...session.locationDetails, address: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Room</label>
              <input
                type="text"
                value={session.locationDetails?.room || ''}
                onChange={(e) => onUpdate('locationDetails', { ...session.locationDetails, room: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
