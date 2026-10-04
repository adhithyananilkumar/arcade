'use client';

import { useEffect, useState } from 'react';

/**
 * Whether `.dark` is on `<html>` — for third-party widgets that take a theme prop instead of
 * following CSS (sonner, the Markdown editor). Reads the document rather than the app's theme
 * store, so shared code stays free of infrastructure (shared → infrastructure is a reverse
 * dependency). The class itself is owned by AppearanceController.
 */
export function useDocumentTheme(): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setTheme(root.classList.contains('dark') ? 'dark' : 'light');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return theme;
}
