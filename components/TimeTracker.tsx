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

    // The backend now automatically tracks time based on the active WebSocket connection.
    // We no longer need to poll/ping continuously.

    // Dispatch a local event every minute to update the UI live
    const interval = setInterval(() => {
      window.dispatchEvent(new CustomEvent('localTimeIncrement', { detail: { seconds: 60 } }));
    }, 60000);

    return () => {
      clearInterval(interval);
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [user, accessToken]);

  return null;
}
