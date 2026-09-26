export type GreetingContext = {
  firstName?: string | null;
  /** Stable per-user id (username/email/id) so two people don’t share the same line at the same hour */
  userKey?: string | null;
  createdAt?: string | null;
  enrolledCount: number;
  streak: number;
  hasSeenHomeBefore: boolean;
};

export type DynamicGreeting = {
  /** Text before the name (may be empty) */
  before: string;
  /** Display name to gradient-highlight — always at end of the hero line */
  name: string;
  /** Text after the name (usually empty when name trails the line) */
  after: string;
  subline: string;
};

function firstNameOrFallback(name?: string | null) {
  const n = name?.trim();
  return n && n.length > 0 ? n.split(' ')[0] : 'there';
}

function daysSince(iso?: string | null) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Per-user + time pick.
 * Same user/hour stays stable on remount; different users diverge even at the same clock time.
 * Also mixes a tiny random session seed (sessionStorage) so reloads in a new tab/session feel fresh.
 */
function pick<T>(arr: T[], userKey: string, salt: number): T {
  if (arr.length === 0) throw new Error('empty pick');

  const day = Math.floor(Date.now() / 86_400_000);
  const hour = new Date().getHours();
  const userHash = hashStr(userKey || 'anon');

  let sessionNoise = 0;
  if (typeof window !== 'undefined') {
    const sk = `arcade.greet.seed.${userKey || 'anon'}.${day}`;
    try {
      let raw = sessionStorage.getItem(sk);
      if (!raw) {
        raw = String(Math.floor(Math.random() * 1_000_000));
        sessionStorage.setItem(sk, raw);
      }
      sessionNoise = Number(raw) || 0;
    } catch {
      sessionNoise = userHash % 997;
    }
  }

  const idx =
    Math.abs(userHash * 2654435761 + day * 97 + hour * 13 + salt * 1009 + sessionNoise) %
    arr.length;
  return arr[idx];
}

function line(template: string, name: string, subline: string): DynamicGreeting {
  const token = '{{name}}';
  const idx = template.indexOf(token);
  if (idx === -1) {
    return { before: `${template} `, name, after: '', subline };
  }
  return {
    before: template.slice(0, idx),
    name,
    after: template.slice(idx + token.length),
    subline,
  };
}

// ── Main lines (name trails) ──────────────────────────────────────────────────

const FIRST_VISIT = [
  'Welcome to Arcade, {{name}}.',
  'Your map starts with one click, {{name}}.',
  'Starting line looks good on you, {{name}}.',
  'First day energy — claim it, {{name}}.',
  'The path is open. Walk through, {{name}}.',
  'New chapter unlocked on your map, {{name}}.',
  'Fresh runway for your goals, {{name}}.',
  'Arcade noticed you showed up, {{name}}.',
  'Hello builder, welcome back to {{name}}.',
  'Your seat is waiting. Press go, {{name}}.',
];

const EMPTY_SHELF = [
  'Your map starts with one click, {{name}}.',
  'Ready when you are to explore, {{name}}.',
  'Open runway for your next milestone, {{name}}.',
  'Nothing enrolled yet — chart your course, {{name}}.',
  'Pick your next learning path, {{name}}.',
  'Curiosity first, progress second, {{name}}.',
  'No enrollments yet — infinite options, {{name}}.',
  'Start small, build momentum, {{name}}.',
  'The catalog is waiting for you, {{name}}.',
  'Every great journey starts here, {{name}}.',
];

const STREAK_HOT = (n: number) => [
  `Day ${n}. Your map has momentum, {{name}}.`,
  `${n} days deep on your path, {{name}}.`,
  `On fire for ${n} days straight, {{name}}.`,
  `Streak of ${n}. Keep building, {{name}}.`,
  `${n}-day chain. Protect the streak, {{name}}.`,
  `Consistency is charting your progress, {{name}}.`,
  `Day ${n} and still advancing, {{name}}.`,
  `The calendar is tracking your growth, {{name}}.`,
  `${n} days. Momentum is your superpower, {{name}}.`,
  `Keep the fire burning bright, {{name}}.`,
];

const STREAK_WARM = (n: number) => [
  `${n}-day rhythm. Great cadence, {{name}}.`,
  `Streak of ${n}. Keep the pulse, {{name}}.`,
  `You’re building momentum on your map, {{name}}.`,
  `${n} days in. Stack another, {{name}}.`,
  `Habit forming. Stay on course, {{name}}.`,
  `Showing up is charting your path, {{name}}.`,
  `Cadence over chaos — ${n} days, {{name}}.`,
  `The chain is growing stronger, {{name}}.`,
  `Consistency is the true skill, {{name}}.`,
  `Day ${n}. Same seat tomorrow, {{name}}.`,
];

const LATE_NIGHT = [
  'Quiet hours, loud progress, {{name}}.',
  'Burning the midnight oil for growth, {{name}}?',
  'Late light on your roadmap, {{name}}.',
  'The city sleeps, your map grows, {{name}}.',
  'Night shift on your journey, {{name}}.',
  'Silence is your focus window, {{name}}.',
  'Deep work hours — use them, {{name}}.',
  'Stars out, roadmap open, {{name}}.',
  'Focus mode active after dark, {{name}}.',
  'Midnight lab is open for progress, {{name}}.',
];

const MORNING = [
  'Fresh canvas for your journey, {{name}}.',
  'Morning light on your roadmap, {{name}}.',
  'First move of the day is yours, {{name}}.',
  'Coffee optional, progress essential, {{name}}.',
  'Sunrise energy on your path, {{name}}.',
  'Clear desk, clear direction, {{name}}.',
  'Start before the world wakes up, {{name}}.',
  'Morning advantage on your goals, {{name}}.',
  'Warm-up lesson for your mind, {{name}}.',
  'Early start, faster progress, {{name}}.',
];

const MIDDAY = [
  'Welcome back to your learning lab, {{name}}.',
  'Midday momentum on your journey, {{name}}.',
  'What’s next on your roadmap, {{name}}?',
  'Sun’s high, standards higher, {{name}}.',
  'Afternoon runway is clear for progress, {{name}}.',
  'Ship one key milestone today, {{name}}.',
  'Midday reset, then chart forward, {{name}}.',
  'The day is still yours to conquer, {{name}}.',
  'Prime hours for your next step, {{name}}.',
  'Keep the momentum thread warm, {{name}}.',
];

const EVENING = [
  'Evening stretch on your path, {{name}}.',
  'Wind-down mode with solid progress, {{name}}?',
  'One more win on your roadmap, {{name}}.',
  'Sunset session for your goals, {{name}}.',
  'Golden hour for deep learning, {{name}}.',
  'Finish a milestone before dinner, {{name}}.',
  'Stack another step tonight, {{name}}.',
  'Evening quiet fuels your growth, {{name}}.',
  'Tonight’s focus builds tomorrow, {{name}}.',
  'Wrap the day with new insights, {{name}}.',
];

const NIGHT = [
  'Night shift looks great on your map, {{name}}.',
  'Late focus on your goals, {{name}}.',
  'The quiet hours are yours to build, {{name}}.',
  'After hours, still advancing, {{name}}.',
  'Dim lights, bright milestones, {{name}}.',
  'End the day sharper than you started, {{name}}.',
  'Night mode unlocked for progress, {{name}}.',
  'One more page on your journey, {{name}}.',
  'The world slowed down, your growth didn’t, {{name}}.',
  'Late is still right on time for learning, {{name}}.',
];

// ── Sublines ──────────────────────────────────────────────────────────────────

const SUB_FIRST = [
  'Pick a path, join a challenge, or explore what’s live today.',
  'Start with one course. Momentum does the rest.',
  'Tour the catalog — then claim something that pulls you in.',
  'No pressure. Just a clean place to begin.',
  'Curiosity first. Credentials later.',
];

const SUB_EMPTY = [
  'Start with a course below, or jump into an upcoming event.',
  'Browse tags that match your mood — then enroll.',
  'Your next skill is one search away.',
  'Empty shelves fill fast once you pick a direction.',
  'Find a course that feels slightly too hard. That’s the one.',
];

const SUB_STREAK = [
  'Keep the chain going. A little today beats a perfect tomorrow.',
  'Don’t break the rhythm — even ten minutes counts.',
  'Streaks love boring consistency.',
  'Show up again and the calendar does the bragging.',
  'Protect the streak like it’s a product.',
  'Tiny session. Same unbroken line.',
];

const SUB_LATE = [
  'The platform’s yours — learn something that sticks.',
  'Deep work loves these hours. Use them.',
  'Ship one concept before you sleep.',
  'Quiet rooms make loud breakthroughs.',
  'Pick a focused lesson. Skip the noise.',
  'Night learning compounds differently.',
];

const SUB_MORNING = [
  'Ship a lesson before the day fills up.',
  'Front-load progress while the inbox is still quiet.',
  'Morning modules hit harder. Start one.',
  'Win the first hour — the rest follows.',
  'Coffee optional. A finished lesson isn’t.',
];

const SUB_MID = [
  'Continue a course or claim a seat at an upcoming event.',
  'Use this pocket of time before it evaporates.',
  'Resume where you left off — friction is the enemy.',
  'One module now > three “laters”.',
  'Midday is for finishing, not scrolling.',
];

const SUB_EVE = [
  'A short lesson tonight still counts on the streak.',
  'Close the day with something you’ll remember.',
  'Evening lessons stick when the world slows down.',
  'Ten focused minutes beat another hour of drift.',
  'End on a win. Tomorrow starts ahead.',
];

const SUB_NIGHT = [
  'Pick something focused. Tomorrow will thank you.',
  'One clean concept, then rest.',
  'Late learning is still learning — make it count.',
  'Wind down with a lesson, not a rabbit hole.',
  'Sleep on progress, not on “I’ll do it tomorrow”.',
];

/**
 * Context-sensitive home greetings.
 * Main line always ends with the gradient name for focus.
 * Pools are large so the page feels fresh across hours/days.
 */
export function getDynamicGreeting(ctx: GreetingContext): DynamicGreeting {
  const name = firstNameOrFallback(ctx.firstName);
  const ageDays = daysSince(ctx.createdAt);
  const hour = new Date().getHours();
  const userKey =
    (ctx.userKey && ctx.userKey.trim()) ||
    (ctx.firstName && ctx.firstName.trim()) ||
    'anon';

  const take = <T,>(arr: T[], salt: number) => pick(arr, userKey, salt);

  if (!ctx.hasSeenHomeBefore || (ageDays !== null && ageDays <= 1)) {
    return line(take(FIRST_VISIT, 1), name, take(SUB_FIRST, 2));
  }

  if (ctx.enrolledCount === 0) {
    return line(take(EMPTY_SHELF, 3), name, take(SUB_EMPTY, 4));
  }

  if (ctx.streak >= 7) {
    return line(take(STREAK_HOT(ctx.streak), 5), name, take(SUB_STREAK, 6));
  }

  if (ctx.streak >= 2) {
    return line(take(STREAK_WARM(ctx.streak), 7), name, take(SUB_STREAK, 8));
  }

  if (hour < 5) {
    return line(take(LATE_NIGHT, 9), name, take(SUB_LATE, 10));
  }
  if (hour < 11) {
    return line(take(MORNING, 11), name, take(SUB_MORNING, 12));
  }
  if (hour < 17) {
    return line(take(MIDDAY, 13), name, take(SUB_MID, 14));
  }
  if (hour < 21) {
    return line(take(EVENING, 15), name, take(SUB_EVE, 16));
  }

  return line(take(NIGHT, 17), name, take(SUB_NIGHT, 18));
}

export const HOME_SEEN_KEY = 'arcade.home.seen';
