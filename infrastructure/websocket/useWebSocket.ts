'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { WS_ORIGIN } from '@/infrastructure/config/env';

export function toBrokerUrl(httpBase: string): string {
  const base = httpBase.replace(/\/$/, '');
  if (base.startsWith('https://')) return `wss://${base.slice('https://'.length)}/ws`;
  if (base.startsWith('http://')) return `ws://${base.slice('http://'.length)}/ws`;
  if (base.startsWith('wss://') || base.startsWith('ws://')) {
    return base.endsWith('/ws') ? base : `${base}/ws`;
  }
  return `ws://${base}/ws`;
}

/**
 * Generic authenticated STOMP client for the shared `/ws` endpoint
 * (see backend WebSocketConfig). Any domain that needs a live push channel — notifications,
 * forum activity, presence, etc. — can subscribe to its own destination without standing up a
 * new connection; this hook owns exactly one underlying client per mounted consumer.
 *
 * Uses native WebSocket (same as TimeTracker) so it matches the Spring endpoint registered
 * without SockJS. Consumers should subscribe when {@code connected} becomes true and clean up
 * on disconnect — that way reconnects automatically re-attach handlers.
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

    const brokerURL = toBrokerUrl(WS_ORIGIN);

    const client = new Client({
      brokerURL,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [status, accessToken, disconnect]);

  return { subscribe, disconnect, connected, clientRef };
}
