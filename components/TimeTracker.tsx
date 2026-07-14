'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { Client } from '@stomp/stompjs';

export default function TimeTracker() {
  const { user, accessToken } = useAuthStore();
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user || !accessToken) return;

    // Connect to WebSocket using STOMP
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: function (str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to WebSocket server');
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    stompClientRef.current = client;

    // Set up the interval to ping every 10 seconds
    const interval = setInterval(() => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.publish({
          destination: '/app/time/ping',
          body: JSON.stringify({ seconds: 10 }),
        });
        // Dispatch local event in case the heatmap is currently being viewed
        window.dispatchEvent(new Event('timeTrackerUpdated'));
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [user, accessToken]);

  return null;
}
