'use client';

import { useEffect } from 'react';
import { useWebSocket as useInfrastructureWebSocket } from '@/infrastructure/websocket/useWebSocket';
import { useForumStore } from '../store/forum.store';

/**
 * Forum-specific wrapper around the canonical STOMP websocket connection
 * (infrastructure/websocket/useWebSocket). Adds only the forum-store
 * connection-status sync that this domain needs on top of the shared
 * transport — the actual client/broker-URL/reconnect logic lives in exactly
 * one place now.
 */
export function useWebSocket() {
  const ws = useInfrastructureWebSocket();
  const setWsConnected = useForumStore((s) => s.setWsConnected);

  useEffect(() => {
    setWsConnected(ws.connected);
  }, [ws.connected, setWsConnected]);

  return ws;
}
