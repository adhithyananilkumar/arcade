'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from '@/store/auth.store';
import { useForumStore } from '../store/forum.store';

export function useWebSocket() {
  const clientRef = useRef<Client | null>(null);
  const { accessToken, status } = useAuthStore();
  const setWsConnected = useForumStore((s) => s.setWsConnected);

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
    setWsConnected(false);
  }, [setWsConnected]);

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
      onConnect: () => {
        setWsConnected(true);
      },
      onDisconnect: () => {
        setWsConnected(false);
      },
      onStompError: () => {
        setWsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setWsConnected(false);
    };
  }, [status, accessToken, disconnect, setWsConnected]);

  return { subscribe, disconnect, clientRef };
}
