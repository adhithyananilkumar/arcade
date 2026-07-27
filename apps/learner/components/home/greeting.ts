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
  'You’re in. Let’s build, {{name}}.',
  'Starting line looks good on you, {{name}}.',
  'First day energy — claim it, {{name}}.',
  'The door’s open. Walk through, {{name}}.',
  'New chapter unlocked, {{name}}.',
  'Fresh account. Fresh runway, {{name}}.',
  'Arcade noticed you showed up, {{name}}.',
  'Hello, builder. Hello, {{name}}.',
  'Seat’s yours. Press go, {{name}}.',
];

const EMPTY_SHELF = [
  'Ready when you are, {{name}}.',
  'Empty shelf. Open runway, {{name}}.',
  'Nothing enrolled yet — plenty of room, {{name}}.',
  'Blank canvas day, {{name}}.',
  'Pick a lane. Any lane, {{name}}.',
  'Curiosity first. Courses second, {{name}}.',
  'Your map starts with one click, {{name}}.',
  'No enrollments. Infinite options, {{name}}.',
  'Start small. Finish loud, {{name}}.',
  'The catalog’s waiting on you, {{name}}.',
];

const STREAK_HOT = (n: number) => [
  `Day ${n}. The streak’s got teeth, {{name}}.`,
  `${n} days deep — don’t drop it, {{name}}.`,
  `On fire for ${n} days straight, {{name}}.`,
  `Streak of ${n}. Quiet flex, {{name}}.`,
  `${n}-day chain. Keep the links, {{name}}.`,
  `Consistency looks expensive on you, {{name}}.`,
  `Day ${n} and still showing up, {{name}}.`,
  `The calendar’s proud of you, {{name}}.`,
  `${n} days. Momentum is the product, {{name}}.`,
  `Don’t ghost the streak now, {{name}}.`,
];

const STREAK_WARM = (n: number) => [
  `${n}-day rhythm. Nice cadence, {{name}}.`,
  `Streak of ${n} — keep the pulse, {{name}}.`,
  `You’re building momentum, {{name}}.`,
  `${n} days in. Stack another, {{name}}.`,
  `Habit forming. Stay close, {{name}}.`,
  `Two-plus days is a signal, {{name}}.`,
  `Cadence over chaos — ${n} days, {{name}}.`,
  `The chain is short. Make it longer, {{name}}.`,
  `Showing up is the skill, {{name}}.`,
  `Day ${n}. Same seat tomorrow, {{name}}.`,
];

const LATE_NIGHT = [
  'Quiet hours. Big focus, {{name}}.',
  'Burning the midnight oil, {{name}}?',
  'Late light, sharp mind, {{name}}.',
  'The city sleeps. You don’t, {{name}}.',
  '3am clarity hits different, {{name}}.',
  'Night shift. Rare and useful, {{name}}.',
  'Silence is a feature tonight, {{name}}.',
  'Deep work window — take it, {{name}}.',
  'Stars out. Tabs open, {{name}}.',
  'Focus mode: after dark, {{name}}.',
  'When the noise drops, you rise, {{name}}.',
  'Midnight lab is open, {{name}}.',
  'Quiet hours. Loud progress, {{name}}.',
  'Owls learn too, {{name}}.',
  'The best bugs show at night, {{name}}.',
];

const MORNING = [
  'Fresh canvas, {{name}}.',
  'Morning light hits different here, {{name}}.',
  'First move of the day is yours, {{name}}.',
  'Coffee optional. Progress isn’t, {{name}}.',
  'Sunrise energy. Channel it, {{name}}.',
  'Clear desk. Clear head, {{name}}.',
  'Start before the inbox does, {{name}}.',
  'Morning advantage: yours, {{name}}.',
  'Warm-up lesson. Then the day, {{name}}.',
  'Early is a cheat code, {{name}}.',
  'New day. Same ambition, {{name}}.',
  'Open the tab that matters, {{name}}.',
  'Build before breakfast excuses, {{name}}.',
  'The morning belongs to finishers, {{name}}.',
  'Soft light. Hard focus, {{name}}.',
];

const MIDDAY = [
  'Back in the lab, {{name}}.',
  'Midday momentum — use it, {{name}}.',
  'What’s next on your board, {{name}}?',
  'Lunch can wait. This can’t, {{name}}.',
  'Sun’s high. Standards higher, {{name}}.',
  'Afternoon runway is clear, {{name}}.',
  'Ship one thing before 3, {{name}}.',
  'Midday reset. Then resume, {{name}}.',
  'The day is still yours, {{name}}.',
  'Prime hours. Don’t waste them, {{name}}.',
  'Between meetings — learn, {{name}}.',
  'Focus pocket spotted. Dive in, {{name}}.',
  'Progress over perfection today, {{name}}.',
  'One module. Then the world, {{name}}.',
  'Keep the thread warm, {{name}}.',
];

const EVENING = [
  'Evening stretch, {{name}}.',
  'Wind-down mode, still hungry, {{name}}?',
  'One more win before close, {{name}}.',
  'Sunset lesson. Solid choice, {{name}}.',
  'Day’s long. Ambition longer, {{name}}.',
  'Golden hour for deep work, {{name}}.',
  'Finish a chapter before dinner, {{name}}.',
  'Evening quiet is underrated, {{name}}.',
  'Stack a small win tonight, {{name}}.',
  'The streak still counts after 6, {{name}}.',
  'Soft lights. Sharp clicks, {{name}}.',
  'Wrap the day with learning, {{name}}.',
  'One lesson. Zero regret, {{name}}.',
  'Close the loop before sleep, {{name}}.',
  'Tonight’s you builds tomorrow’s you, {{name}}.',
];

const NIGHT = [
  'Night shift looks good on you, {{name}}.',
  'Late focus — rare and useful, {{name}}.',
  'The quiet hours are yours, {{name}}.',
  'After hours. Still hungry, {{name}}.',
  'Dim lights. Bright ideas, {{name}}.',
  'Last call for a lesson, {{name}}.',
  'End the day sharper than you started, {{name}}.',
  'Night mode unlocked, {{name}}.',
  'One more page. Then rest, {{name}}.',
  'The world slowed down. You didn’t, {{name}}.',
  'Late is still on time for learning, {{name}}.',
  'Whisper-mode productivity, {{name}}.',
  'Clock’s late. Ambition isn’t, {{name}}.',
  'Finish strong, sleep better, {{name}}.',
  'Dark sky. Light bulb moments, {{name}}.',
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
