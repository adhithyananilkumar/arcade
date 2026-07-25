'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

/**
 * Generic authenticated STOMP-over-SockJS client for the shared `/ws` endpoint
 * (see backend WebSocketConfig). Any domain that needs a live push channel — notifications,
 * forum activity, presence, etc. — can subscribe to its own destination without standing up a
 * new connection; this hook owns exactly one underlying client per mounted consumer.
 */
export function useWebSocket() {
  const clientRef = useRef<Client | null>(null);
  const { accessToken, status } = useAuthStore();
  const [connected, setConnected] = useState(false);

  const subscribe = useCallback((destination: string, callback: (body: unknown) => void) => {
    if (!clientRef.current || !clientRef.current.connected) return () => {};
    const sub = clientRef.current.subscribe(destination, (msg) => {
      try {
        callback(JSON.parse(msg.body));
      } catch {
        callback(msg.body);
      }
    });
    return () => sub.unsubscribe();
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setConnected(false);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || !accessToken) {
      disconnect();
      return;
    }

    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080') + '/ws';

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as WebSocket,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setConnected(false);
    };
  }, [status, accessToken, disconnect]);

  return { subscribe, disconnect, connected, clientRef };
}
