/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Identity
 *
 * Purpose:
 * The nickname — what we call someone in their own signed-in chrome (home greeting, nav pill).
 *
 * Rules:
 * - PRIVATE to its owner. The backend only returns it on the caller's own profile. Never render
 *   it on a public profile, in a post, a comment, a directory, or anything another person sees.
 * - Shape mirrored from the backend's `Nickname` and the V325 CHECK constraints so the field can
 *   format as somebody types. The server validates independently and its answer wins.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 8;

/** Same text as `Nickname.SHAPE_REGEX` on the backend. */
const SHAPE = /^[A-Z][a-z.-]*( [A-Za-z][a-z.-]*)*$/;
const ALLOWED = /[A-Za-z .-]/;
const LETTER = /[A-Za-z]/;

/** Characters that count toward the limit — everything but the spaces between words. */
export function nicknameLength(value: string): number {
  return value.replace(/ /g, '').length;
}

/**
 * Formats raw keystrokes into the nickname shape, so the field can never hold something the
 * server would reject for its case or characters:
 * - the first letter is forced to a capital;
 * - the first letter of a later word is kept exactly as typed ("Dr. Rubin" or "Dr. rubin");
 * - every other letter is forced to lowercase ("Dr. RUBIN" becomes "Dr. Rubin");
 * - anything but letters, dots and hyphens is dropped, spaces collapse to one, and each word must
 *   start with a letter;
 * - input stops at {@link NICKNAME_MAX_LENGTH} characters, not counting spaces.
 *
 * A single trailing space is kept so the next word can be typed; {@link nicknameError} trims.
 */
export function formatNicknameInput(raw: string): string {
  let out = '';
  let counted = 0;
  for (const ch of raw) {
    if (!ALLOWED.test(ch)) continue;
    const wordStart = out === '' || out.endsWith(' ');
    if (ch === ' ') {
      if (!wordStart) out += ' ';
      continue;
    }
    if (counted >= NICKNAME_MAX_LENGTH) break;
    if (wordStart && !LETTER.test(ch)) continue;
    if (out === '') out += ch.toUpperCase();
    else if (wordStart) out += ch;
    else out += ch.toLowerCase();
    counted++;
  }
  return out;
}

/** Null when the (trimmed) nickname is well-formed, or the reason it is not. */
export function nicknameError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Tell us what to call you.';
  const length = nicknameLength(trimmed);
  if (length < NICKNAME_MIN_LENGTH || length > NICKNAME_MAX_LENGTH)
    return `Use ${NICKNAME_MIN_LENGTH}–${NICKNAME_MAX_LENGTH} characters.`;
  if (!SHAPE.test(trimmed))
    return 'Start with a capital letter and use lowercase after the first letter of each word.';
  return null;
}

/** "ADHITHYAN" → "Adhithyan": first letter capital, the rest lowercase. */
function sentenceCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function firstWord(value?: string | null): string {
  return value?.trim().split(/\s+/)[0] ?? '';
}

/**
 * A starting value for the onboarding field, from the first name. Empty when the first name would
 * not fit — cutting someone's name short and presenting it as a suggestion reads as a typo.
 */
export function suggestNickname(firstName?: string | null): string {
  const word = firstWord(firstName);
  const formatted = formatNicknameInput(sentenceCase(word));
  return formatted === sentenceCase(word) && !nicknameError(formatted) ? formatted : '';
}

type NamedUser = { nickname?: string | null; firstName?: string | null; fullName?: string | null };

/**
 * The name on the home greeting: the nickname, or — for accounts that predate nicknames — the
 * first name, shown first letter capital and the rest lowercase.
 */
export function greetingName(user?: NamedUser | null): string {
  const nickname = user?.nickname?.trim();
  if (nickname) return nickname;
  const word = firstWord(user?.firstName) || firstWord(user?.fullName);
  return word ? sentenceCase(word) : 'there';
}

/** The name on the top-nav profile pill: the same name, all lowercase. */
export function navPillName(user?: NamedUser | null): string {
  const name = greetingName(user);
  return name === 'there' ? 'user' : name.toLowerCase();
}
