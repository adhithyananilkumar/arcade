import { hashString } from './rng';

/**
 * Category themes for generated content artwork.
 *
 * Categories are written by platform admins (Console → Content manage → Categories), so they are
 * free text. Each theme lists the words that identify it; a content item is matched on its
 * category first and its title second ("Gen AI and LLM" in "Other" still reads as AI). Anything
 * unmatched falls back to the General theme.
 *
 * Colours are chosen per theme so a catalogue reads by subject at a glance, while staying inside
 * Arcade's palette: soft paper grounds, one confident hue, ink #14142b for line work.
 */

export interface ArtPalette {
  /** Light ground for courses and exams. */
  paper: string;
  /** Tint for blobs, stages and fills. */
  soft: string;
  /** Main hue. */
  main: string;
  /** Second hue. */
  accent: string;
  /** Warm or contrasting spark. */
  spark: string;
  /** Deep and vivid ends of the event poster gradient. */
  deep: string;
  vivid: string;
}

export type ArtThemeKey =
  | 'ai'
  | 'code'
  | 'data'
  | 'security'
  | 'cloud'
  | 'design'
  | 'business'
  | 'finance'
  | 'math'
  | 'science'
  | 'electronics'
  | 'engineering'
  | 'language'
  | 'health'
  | 'music'
  | 'general';

export interface ArtTheme {
  key: ArtThemeKey;
  label: string;
  /** Lower-case words or phrases; matched as whole words. */
  keywords: string[];
  palettes: ArtPalette[];
}

export const INK = '#14142b';

export const ART_THEMES: ArtTheme[] = [
  {
    key: 'ai',
    label: 'Artificial intelligence',
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'llm', 'llms', 'gen ai', 'genai', 'generative', 'neural', 'deep learning', 'nlp', 'gpt', 'computer vision', 'prompt', 'agents', 'transformer'],
    palettes: [
      { paper: '#F7F6FE', soft: '#E6E3FD', main: '#6D5DF6', accent: '#2BB0ED', spark: '#F59E0B', deep: '#1E1B4B', vivid: '#6D5DF6' },
      { paper: '#F5F8FF', soft: '#DCE7FF', main: '#4C6FFF', accent: '#A855F7', spark: '#F472B6', deep: '#172554', vivid: '#4C6FFF' },
    ],
  },
  {
    key: 'code',
    label: 'Programming',
    keywords: ['programming', 'coding', 'code', 'software', 'web', 'javascript', 'typescript', 'python', 'java', 'c++', 'react', 'node', 'full stack', 'fullstack', 'frontend', 'front end', 'backend', 'back end', 'developer', 'development', 'app', 'apps', 'android', 'ios', 'flutter', 'dsa', 'algorithms', 'data structures', 'git', 'html', 'css', 'spring'],
    palettes: [
      { paper: '#F4FBF8', soft: '#D6F5E8', main: '#10A37F', accent: '#3B82F6', spark: '#F59E0B', deep: '#052E26', vivid: '#0E9F6E' },
      { paper: '#F6F8FB', soft: '#E2E8F0', main: '#334155', accent: '#22C55E', spark: '#38BDF8', deep: '#0F172A', vivid: '#2563EB' },
    ],
  },
  {
    key: 'data',
    label: 'Data & analytics',
    keywords: ['data', 'analytics', 'analysis', 'sql', 'database', 'databases', 'statistics', 'big data', 'visualization', 'visualisation', 'excel', 'power bi', 'tableau', 'data science', 'pandas', 'warehouse'],
    palettes: [
      { paper: '#F3F9FF', soft: '#D7ECFF', main: '#0EA5E9', accent: '#6366F1', spark: '#F97316', deep: '#082F49', vivid: '#0284C7' },
      { paper: '#F6F7FF', soft: '#E0E7FF', main: '#4F46E5', accent: '#14B8A6', spark: '#FACC15', deep: '#1E1B4B', vivid: '#4338CA' },
    ],
  },
  {
    key: 'security',
    label: 'Cyber security',
    keywords: ['security', 'cyber', 'cybersecurity', 'hacking', 'ethical hacking', 'cryptography', 'forensics', 'penetration', 'malware', 'privacy', 'infosec', 'ctf', 'firewall'],
    palettes: [
      { paper: '#F2FBF6', soft: '#D1F4E0', main: '#16A34A', accent: '#0F172A', spark: '#22D3EE', deep: '#04150D', vivid: '#15803D' },
      { paper: '#F7F7FA', soft: '#E4E4EF', main: '#1F2A44', accent: '#EF4444', spark: '#22C55E', deep: '#0B0F1A', vivid: '#334155' },
    ],
  },
  {
    key: 'cloud',
    label: 'Cloud & DevOps',
    keywords: ['cloud', 'devops', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'linux', 'server', 'servers', 'networking', 'network', 'networks', 'infrastructure', 'sre', 'ci cd', 'operating systems', 'os'],
    palettes: [
      { paper: '#F2F9FF', soft: '#D9EEFF', main: '#3B82F6', accent: '#06B6D4', spark: '#F59E0B', deep: '#0C1E3D', vivid: '#2563EB' },
      { paper: '#F5FBFB', soft: '#D5F2F2', main: '#0891B2', accent: '#6366F1', spark: '#FB923C', deep: '#083344', vivid: '#0E7490' },
    ],
  },
  {
    key: 'design',
    label: 'Design',
    keywords: ['design', 'ui', 'ux', 'ui ux', 'graphic', 'graphics', 'figma', 'animation', 'illustration', 'creative', 'photography', 'photo', 'video', 'editing', 'branding', 'motion', '3d', 'blender', 'art'],
    palettes: [
      { paper: '#FFF6F8', soft: '#FFDDE6', main: '#EC4899', accent: '#8B5CF6', spark: '#F59E0B', deep: '#3B0A24', vivid: '#DB2777' },
      { paper: '#FFF8F2', soft: '#FFE4CC', main: '#F97316', accent: '#EC4899', spark: '#14B8A6', deep: '#3A1405', vivid: '#EA580C' },
    ],
  },
  {
    key: 'business',
    label: 'Business',
    keywords: ['business', 'management', 'marketing', 'entrepreneurship', 'entrepreneur', 'startup', 'startups', 'leadership', 'hr', 'human resources', 'sales', 'strategy', 'product management', 'mba', 'operations', 'project management', 'branding'],
    palettes: [
      { paper: '#FFFAF1', soft: '#FDEBC8', main: '#D97706', accent: '#1D4ED8', spark: '#10B981', deep: '#2E1A03', vivid: '#B45309' },
      { paper: '#F7F8FC', soft: '#E0E5F5', main: '#1E3A8A', accent: '#F59E0B', spark: '#EF4444', deep: '#0B163A', vivid: '#1D4ED8' },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    keywords: ['finance', 'financial', 'accounting', 'economics', 'investment', 'investing', 'banking', 'trading', 'stock', 'stocks', 'money', 'tax', 'fintech', 'crypto', 'blockchain'],
    palettes: [
      { paper: '#F4FBF4', soft: '#D9F2D9', main: '#15803D', accent: '#CA8A04', spark: '#0EA5E9', deep: '#052E16', vivid: '#16A34A' },
      { paper: '#FFFBF0', soft: '#FCEFC7', main: '#B7791F', accent: '#047857', spark: '#6366F1', deep: '#2A1B02', vivid: '#CA8A04' },
    ],
  },
  {
    key: 'math',
    label: 'Mathematics',
    keywords: ['math', 'maths', 'mathematics', 'calculus', 'algebra', 'geometry', 'trigonometry', 'discrete', 'probability', 'linear algebra', 'number theory', 'arithmetic', 'aptitude', 'quantitative'],
    palettes: [
      { paper: '#F8F6FF', soft: '#E9E2FF', main: '#7C3AED', accent: '#F43F5E', spark: '#0EA5E9', deep: '#2E1065', vivid: '#7C3AED' },
      { paper: '#F5FAFF', soft: '#DBEAFE', main: '#1D4ED8', accent: '#F59E0B', spark: '#EC4899', deep: '#0F1F4D', vivid: '#2563EB' },
    ],
  },
  {
    key: 'science',
    label: 'Science',
    keywords: ['science', 'physics', 'chemistry', 'biology', 'biotech', 'biotechnology', 'lab', 'astronomy', 'space', 'genetics', 'environment', 'environmental', 'ecology', 'quantum'],
    palettes: [
      { paper: '#F2FBFC', soft: '#CFF3F6', main: '#0891B2', accent: '#A855F7', spark: '#F59E0B', deep: '#042F3A', vivid: '#0E7490' },
      { paper: '#F9F6FF', soft: '#EADFFF', main: '#9333EA', accent: '#10B981', spark: '#F97316', deep: '#2B0B4D', vivid: '#7E22CE' },
    ],
  },
  {
    key: 'electronics',
    label: 'Electronics & robotics',
    keywords: ['electronics', 'electronic', 'embedded', 'iot', 'internet of things', 'robotics', 'robot', 'robots', 'circuit', 'circuits', 'vlsi', 'electrical', 'arduino', 'raspberry pi', 'hardware', 'microcontroller', 'drone', 'drones', 'signal processing'],
    palettes: [
      { paper: '#F4FBF7', soft: '#D3F1E2', main: '#059669', accent: '#F59E0B', spark: '#3B82F6', deep: '#032619', vivid: '#047857' },
      { paper: '#FFF8F1', soft: '#FEE3C8', main: '#EA580C', accent: '#0F766E', spark: '#6366F1', deep: '#331203', vivid: '#C2410C' },
    ],
  },
  {
    key: 'engineering',
    label: 'Engineering',
    keywords: ['engineering', 'civil', 'mechanical', 'cad', 'autocad', 'solidworks', 'structural', 'construction', 'automobile', 'automotive', 'manufacturing', 'architecture', 'thermodynamics', 'surveying', 'materials'],
    palettes: [
      { paper: '#F7F8FA', soft: '#E2E8F0', main: '#475569', accent: '#F59E0B', spark: '#0EA5E9', deep: '#111827', vivid: '#475569' },
      { paper: '#FFFAF2', soft: '#FDE9CC', main: '#C2410C', accent: '#334155', spark: '#0EA5E9', deep: '#2B1206', vivid: '#B45309' },
    ],
  },
  {
    key: 'language',
    label: 'Language & communication',
    keywords: ['english', 'language', 'languages', 'communication', 'writing', 'literature', 'soft skills', 'speaking', 'public speaking', 'grammar', 'hindi', 'malayalam', 'french', 'german', 'japanese', 'spanish', 'interview', 'personality', 'presentation'],
    palettes: [
      { paper: '#FFF8F5', soft: '#FFE2D6', main: '#E2553D', accent: '#2563EB', spark: '#F59E0B', deep: '#3A0F06', vivid: '#DC4A2F' },
      { paper: '#F6FBF9', soft: '#D7F0E6', main: '#0F766E', accent: '#E11D48', spark: '#F59E0B', deep: '#042A26', vivid: '#0F766E' },
    ],
  },
  {
    key: 'health',
    label: 'Health',
    keywords: ['health', 'medical', 'medicine', 'nursing', 'fitness', 'psychology', 'wellness', 'mental health', 'nutrition', 'yoga', 'pharmacy', 'healthcare', 'first aid', 'sports'],
    palettes: [
      { paper: '#FFF6F7', soft: '#FFDDE1', main: '#E11D48', accent: '#14B8A6', spark: '#F59E0B', deep: '#3D0614', vivid: '#E11D48' },
      { paper: '#F3FBF8', soft: '#D2F4E6', main: '#0D9488', accent: '#F43F5E', spark: '#6366F1', deep: '#042F2B', vivid: '#0D9488' },
    ],
  },
  {
    key: 'music',
    label: 'Music & audio',
    keywords: ['music', 'audio', 'sound', 'singing', 'guitar', 'piano', 'production', 'podcast', 'dance', 'film', 'theatre'],
    palettes: [
      { paper: '#FBF6FF', soft: '#EFDDFE', main: '#A21CAF', accent: '#F59E0B', spark: '#06B6D4', deep: '#2E0533', vivid: '#A21CAF' },
      { paper: '#F6F7FF', soft: '#DEE1FF', main: '#4338CA', accent: '#F43F5E', spark: '#FACC15', deep: '#14123D', vivid: '#4F46E5' },
    ],
  },
  {
    key: 'general',
    label: 'General',
    keywords: [],
    palettes: [
      { paper: '#F7F8FC', soft: '#E4E9FB', main: '#4C6FFF', accent: '#1DB876', spark: '#F59E0B', deep: '#14142B', vivid: '#4C6FFF' },
      { paper: '#F6FBF8', soft: '#DAF3E6', main: '#1DB876', accent: '#4C6FFF', spark: '#F97316', deep: '#0B2A1D', vivid: '#16A34A' },
      { paper: '#FFF9F2', soft: '#FDE8CF', main: '#F08C2E', accent: '#4C6FFF', spark: '#1DB876', deep: '#2B1504', vivid: '#EA7A12' },
    ],
  },
];

const BY_KEY = new Map(ART_THEMES.map((t) => [t.key, t]));

function normalise(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').trim()} `;
}

function matchTheme(text: string | null | undefined): ArtTheme | null {
  if (!text || !text.trim()) return null;
  const hay = normalise(text);
  let best: { theme: ArtTheme; score: number } | null = null;
  for (const theme of ART_THEMES) {
    for (const keyword of theme.keywords) {
      if (hay.includes(normalise(keyword))) {
        // Longer phrases are more specific: "data science" beats "science".
        const score = keyword.length;
        if (!best || score > best.score) best = { theme, score };
      }
    }
  }
  return best?.theme ?? null;
}

/**
 * The theme for a piece of content: its category if that names a subject, else its title, else
 * General. Never throws and never returns undefined.
 */
export function resolveArtTheme(category?: string | null, title?: string | null): ArtTheme {
  return matchTheme(category) ?? matchTheme(title) ?? BY_KEY.get('general')!;
}

export function artThemeByKey(key: ArtThemeKey): ArtTheme {
  return BY_KEY.get(key) ?? BY_KEY.get('general')!;
}

/** Stable palette choice for a seed within a theme. */
export function paletteFor(theme: ArtTheme, seed: string): ArtPalette {
  return theme.palettes[hashString(`${seed}:palette`) % theme.palettes.length];
}
