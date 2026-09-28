'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Client } from '@stomp/stompjs';
import { WS_ORIGIN } from '@/infrastructure/config/env';
import { toBrokerUrl } from '@/infrastructure/websocket/useWebSocket';

import { getValidAccessToken } from '@/infrastructure/auth/jwt';

export default function TimeTracker() {
  const { user, accessToken } = useAuthStore();
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user || !accessToken) return;

    let isCancelled = false;

    // Connect to WebSocket using STOMP
    const client = new Client({
      brokerURL: toBrokerUrl(WS_ORIGIN),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.beforeConnect = async () => {
      const validToken = await getValidAccessToken();
      if (!validToken) {
        client.reconnectDelay = 0;
        void client.deactivate();
        return;
      }
      client.connectHeaders = {
        Authorization: `Bearer ${validToken}`,
      };
    };

    client.onConnect = () => {
      // Session presence active
    };

    client.onStompError = async (frame) => {
      const message = frame.headers['message'] || '';
      const isAuthError =
        message.includes('STOMP CONNECT rejected') ||
        message.includes('invalid token') ||
        message.includes('Authorization');

      if (isAuthError) {
        // Prevent infinite reconnection loop with stale/invalid token
        client.reconnectDelay = 0;
        void client.deactivate();

        // Attempt silent recovery with fresh token
        const freshToken = await getValidAccessToken();
        if (!freshToken && !isCancelled) {
          useAuthStore.getState().clearAuth();
        }
      } else {
        console.warn('STOMP warning:', message, frame.body);
      }
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
