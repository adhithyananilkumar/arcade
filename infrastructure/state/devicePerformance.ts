/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Infrastructure
 * Subsystem: State
 *
 * Purpose:
 * Decides whether this device gets the "lite" rendering tier — no backdrop blur, near-solid glass,
 * no moving wallpaper or decorative animated layers — and exposes the answer to CSS
 * (`<html data-perf="lite">`) and to code (`isLiteDevice()`).
 *
 * Why: frosted glass is a GPU blur of everything behind each panel, recomputed whenever what's
 * behind it changes — and in an editor that's every keystroke. A 2-core, 4 GB laptop spent its
 * frame budget compositing blur instead of drawing text, which read as typing lag.
 * ------------------------------------------------------------------
 */

/** `localStorage` key that forces a tier: "lite" or "full". Anything else means auto-detect. */
export const PERF_OVERRIDE_KEY = 'arcade-perf';

/**
 * Self-contained: runs inside the pre-paint boot script, before any module loads, so lite devices
 * never paint a single frame of blur. Keep the rule in step with `detectLiteDevice` below.
 */
export const PERF_BOOT_SNIPPET = `try{var pn=navigator,po=null;try{po=localStorage.getItem(${JSON.stringify(PERF_OVERRIDE_KEY)});}catch(e){}
var pc=pn.hardwareConcurrency||8,pm=pn.deviceMemory||8,ps=!!(pn.connection&&pn.connection.saveData);
if(po==='lite'||(po!=='full'&&(pc<=2||pm<=2||(pc<=4&&pm<=4)||ps)))document.documentElement.setAttribute('data-perf','lite');}catch(e){}`;

/** Same rule as the boot snippet, for code that runs after hydration. */
function detectLiteDevice(): boolean {
  // `window`, not `navigator`: Node has a global navigator too, reporting the *server's* cores.
  if (typeof window === 'undefined') return false;
  let override: string | null = null;
  try {
    override = localStorage.getItem(PERF_OVERRIDE_KEY);
  } catch {
    // Storage blocked: fall through to auto-detect.
  }
  if (override === 'lite') return true;
  if (override === 'full') return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const cores = nav.hardwareConcurrency || 8;
  const memory = nav.deviceMemory || 8;
  return cores <= 2 || memory <= 2 || (cores <= 4 && memory <= 4) || !!nav.connection?.saveData;
}

/** True on devices that get the lite rendering tier. */
export function isLiteDevice(): boolean {
  if (typeof document !== 'undefined' && document.documentElement.getAttribute('data-perf') === 'lite') return true;
  return detectLiteDevice();
}
