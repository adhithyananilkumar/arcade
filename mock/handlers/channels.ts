import channels from '../data/channels.json';
import type { Channel } from '../types';
import { itemOr404, listResponse, maybeError, type MockRequest, type MockResult } from './shared';

const DATA = channels as Channel[];

export function listChannels(req: MockRequest): MockResult {
  return listResponse(DATA, req, (i) => ({
    ...DATA[0],
    id: `channel-long-${i}`,
    name: `Generated Channel ${i}`,
  }));
}

export function getChannel(req: MockRequest, id: string): MockResult {
  const err = maybeError(req);
  if (err) return err;
  return itemOr404(DATA.find((c) => c.id === id));
}
