export type GreetingContext = {
  firstName?: string | null;
  createdAt?: string | null;
  enrolledCount: number;
  streak: number;
  hasSeenHomeBefore: boolean;
};

export type DynamicGreeting = {
  /** Text before the name (may be empty) */
  before: string;
  /** Display name to gradient-highlight; null if this line has no name */
  name: string | null;
  /** Text after the name (punctuation etc.) */
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

function splitName(template: string, name: string): Omit<DynamicGreeting, 'subline'> {
  const token = '{{name}}';
  const idx = template.indexOf(token);
  if (idx === -1) {
    return { before: template, name: null, after: '' };
  }
  return {
    before: template.slice(0, idx),
    name,
    after: template.slice(idx + token.length),
  };
}

/**
 * Context-sensitive home greetings — avoids stock "Good morning".
 * Uses {{name}} so the UI can render the name with moving gradient.
 */
export function getDynamicGreeting(ctx: GreetingContext): DynamicGreeting {
  const name = firstNameOrFallback(ctx.firstName);
  const ageDays = daysSince(ctx.createdAt);
  const hour = new Date().getHours();
  const pick = <T,>(arr: T[]) => arr[Math.floor(Date.now() / 36e5) % arr.length];

  const line = (template: string, subline: string): DynamicGreeting => ({
    ...splitName(template, name),
    subline,
  });

  if (!ctx.hasSeenHomeBefore || (ageDays !== null && ageDays <= 1)) {
    return line(
      pick([
        `Welcome to Arcade, {{name}}.`,
        `You're in, {{name}}.`,
        `This is your starting line, {{name}}.`,
      ]),
      'Pick a path, join a challenge, or explore what’s live today.',
    );
  }

  if (ctx.enrolledCount === 0) {
    return line(
      pick([
        `Ready when you are, {{name}}.`,
        `Your shelf is empty — in a good way.`,
        `Nothing enrolled yet. Plenty of runway.`,
      ]),
      'Start with a course below, or jump into an upcoming event.',
    );
  }

  if (ctx.streak >= 7) {
    return line(
      pick([
        `Day ${ctx.streak}. The streak’s got teeth.`,
        `${ctx.streak} days deep — don’t drop it now.`,
        `On fire for ${ctx.streak} days straight.`,
      ]),
      'Keep the chain going. A little today beats a perfect tomorrow.',
    );
  }

  if (ctx.streak >= 2) {
    return line(
      pick([
        `${ctx.streak}-day rhythm. Nice cadence, {{name}}.`,
        `Streak of ${ctx.streak} — keep the pulse.`,
        `You’re building momentum, {{name}}.`,
      ]),
      'Show up again today and the calendar does the bragging.',
    );
  }

  if (hour < 5) {
    return line(
      pick([`Burning the midnight oil, {{name}}?`, `Quiet hours. Big focus.`]),
      'The platform’s yours — learn something that sticks.',
    );
  }
  if (hour < 11) {
    return line(
      pick([
        `Fresh canvas, {{name}}.`,
        `Morning light hits different here.`,
        `First move of the day is yours.`,
      ]),
      'Ship a lesson before the day fills up.',
    );
  }
  if (hour < 17) {
    return line(
      pick([
        `Back in the lab, {{name}}.`,
        `Midday momentum — use it.`,
        `What’s next on your board?`,
      ]),
      'Continue a course or claim a seat at an upcoming event.',
    );
  }
  if (hour < 21) {
    return line(
      pick([
        `Evening stretch, {{name}}.`,
        `Wind-down mode, still hungry?`,
        `One more win before close.`,
      ]),
      'A short lesson tonight still counts on the streak.',
    );
  }

  return line(
    pick([`Night shift looks good on you.`, `Late focus — rare and useful.`]),
    'Pick something focused. Tomorrow will thank you.',
  );
}

export const HOME_SEEN_KEY = 'arcade.home.seen';
