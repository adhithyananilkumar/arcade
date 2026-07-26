import session from '../data/session.json';
import type { User } from '../types';
import { type MockRequest, type MockResult, maybeError } from './shared';

const currentUser = session.user as User;

export function getMe(req: MockRequest): MockResult {
  const err = maybeError(req);
  if (err) return err;
  return { status: 200, body: currentUser };
}

export function getUserActivity(req: MockRequest, username: string): MockResult {
  const err = maybeError(req);
  if (err) return err;

  // Generate some random mock activity data
  const data = [];
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Random chance of activity, higher for recent days
    if (Math.random() > 0.4) {
      data.push({
        date: d.toISOString().split('T')[0],
        secondsSpent: Math.floor(Math.random() * 7200) + 600, // 10 min to 2 hours
      });
    }
  }

  return { status: 200, body: data };
}
