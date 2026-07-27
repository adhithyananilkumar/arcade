'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useForumStore } from '../store/forum.store';

function toBrokerUrl(httpBase: string): string {
  const base = httpBase.replace(/\/$/, '');
  if (base.startsWith('https://')) return `wss://${base.slice('https://'.length)}/ws`;
  if (base.startsWith('http://')) return `ws://${base.slice('http://'.length)}/ws`;
  if (base.startsWith('wss://') || base.startsWith('ws://')) {
    return base.endsWith('/ws') ? base : `${base}/ws`;
  }
  return `ws://${base}/ws`;
}

export function useWebSocket() {
  const clientRef = useRef<Client | null>(null);
  const { accessToken, status } = useAuthStore();
  const setWsConnected = useForumStore((s) => s.setWsConnected);
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
    setWsConnected(false);
  }, [setWsConnected]);

  useEffect(() => {
    if (status !== 'authenticated' || !accessToken) {
      disconnect();
      return;
    }

    const brokerURL = toBrokerUrl(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080');

    const client = new Client({
      brokerURL,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        setWsConnected(true);
      },
      onDisconnect: () => {
        setConnected(false);
        setWsConnected(false);
      },
      onStompError: () => {
        setConnected(false);
        setWsConnected(false);
      },
      onWebSocketClose: () => {
        setConnected(false);
        setWsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
      setWsConnected(false);
    };
  }, [status, accessToken, disconnect, setWsConnected]);

  return { subscribe, disconnect, connected, clientRef };
}
