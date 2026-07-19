'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useForumStore } from '../store/forum.store';
import { useNotifications } from '../hooks/useNotifications';
import { useNotifications as useNotificationQuery } from '../api/forum.queries';
import { NotificationItem } from './NotificationItem';

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = useForumStore((s) => s.unreadNotificationCount);
  const { notifications: wsNotifications, markAllRead } = useNotifications();
  const { data: restData } = useNotificationQuery(0, 10);

  // Merge WS and REST notifications, deduplicated by id
  const allNotifications = [
    ...wsNotifications,
    ...(restData?.content || []),
  ].filter((n, idx, arr) => arr.findIndex((x) => x.id === n.id) === idx);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          backgroundColor: '#fff',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
        }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 16,
              height: 16,
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#dc2626',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: 360,
              backgroundColor: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              overflow: 'hidden',
              zIndex: 100,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    fontSize: 12,
                    color: 'var(--arcade-blue)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Items */}
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {allNotifications.length === 0 ? (
                <div
                  style={{
                    padding: 32,
                    textAlign: 'center',
                    fontSize: 13,
                    color: 'var(--text-muted)',
                  }}
                >
                  No notifications yet
                </div>
              ) : (
                allNotifications.slice(0, 10).map((n) => (
                  <NotificationItem key={n.id} notification={n} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
