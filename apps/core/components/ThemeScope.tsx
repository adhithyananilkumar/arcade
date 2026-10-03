'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Marks its subtree as the themed, signed-in app. The viewer's appearance
 * (dark, high contrast, glass) applies only while a ThemeScope is mounted;
 * public pages — landing, explore, sign-in — always render the standard
 * light design.
 *
 * Mounted once, by the (authenticated) layout.
 * ------------------------------------------------------------------
 */

import { useLayoutEffect } from 'react';
import { useThemeScopeStore } from '@/infrastructure/state/theme.store';

export function ThemeScope() {
  useLayoutEffect(() => {
    const { enter, leave } = useThemeScopeStore.getState();
    enter();
    return leave;
  }, []);
  return null;
}
