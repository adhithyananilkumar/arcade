import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_THEME_ROUTE } from './theme.store';

/**
 * The theme applies only inside the signed-in app. APP_THEME_ROUTE is the boot script's
 * first-paint guess at that boundary; the (authenticated) route group is the real one. This test
 * keeps them in step: every (authenticated) page must match, no (public) or (onboarding) page may.
 */

const APP_DIR = path.resolve(__dirname, '../../app');

/** Every page URL under a route group, with dynamic segments filled with a sample value. */
function pagesIn(group: string): string[] {
  const root = path.join(APP_DIR, group);
  const urls: string[] = [];
  const walk = (dir: string, segments: string[]) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name.startsWith('(') || entry.name.startsWith('_') || entry.name === 'components') {
          walk(path.join(dir, entry.name), segments);
          continue;
        }
        const segment = entry.name.startsWith('[') ? 'sample-id' : entry.name;
        walk(path.join(dir, entry.name), [...segments, segment]);
      } else if (/^page\.(tsx|ts|jsx|js)$/.test(entry.name)) {
        urls.push('/' + segments.join('/'));
      }
    }
  };
  walk(root, []);
  return urls;
}

describe('theme scope', () => {
  it('covers every signed-in page', () => {
    const pages = pagesIn('(authenticated)');
    expect(pages.length).toBeGreaterThan(20);
    expect(pages.filter((url) => !APP_THEME_ROUTE.test(url))).toEqual([]);
  });

  it('never themes a public or onboarding page', () => {
    const pages = [...pagesIn('(public)'), ...pagesIn('(onboarding)'), '/', '/sign', '/forgot-password'];
    expect(pages.filter((url) => APP_THEME_ROUTE.test(url))).toEqual([]);
  });
});
