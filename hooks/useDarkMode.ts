import { useState, useEffect } from 'react';

export type ThemePreference = 'auto' | 'light' | 'dark' | 'ink';
export type ResolvedTheme = 'light' | 'dark' | 'ink';

interface ThemeHookResult {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  cycleTheme: () => void;
  setThemePreference: (value: ThemePreference) => void;
}

const THEME_KEY = 'theme-preference';
const ORDER: ThemePreference[] = ['auto', 'light', 'dark', 'ink'];

function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === 'auto') return systemPrefersDark ? 'dark' : 'light';
  return preference;
}

export const useDarkMode = (): ThemeHookResult => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('auto');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  const setThemePreference = (value: ThemePreference) => {
    setThemePreferenceState(value);
    window.localStorage.setItem(THEME_KEY, value);
  };

  const cycleTheme = () => {
    const currentIndex = ORDER.indexOf(themePreference);
    const next = ORDER[(currentIndex + 1) % ORDER.length];
    setThemePreference(next);
  };

  useEffect(() => {
    const localTheme = window.localStorage.getItem(THEME_KEY) as ThemePreference | null;
    if (localTheme && ORDER.includes(localTheme)) {
      setThemePreferenceState(localTheme);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyResolved = () => {
      setResolvedTheme(resolveTheme(themePreference, mediaQuery.matches));
    };

    applyResolved();
    mediaQuery.addEventListener('change', applyResolved);
    return () => mediaQuery.removeEventListener('change', applyResolved);
  }, [themePreference]);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    root.classList.remove('dark');
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    }

    body.classList.toggle('book-mode', resolvedTheme === 'ink');

    root.classList.add('theme-transition');
    const timeout = window.setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [resolvedTheme]);

  return { themePreference, resolvedTheme, cycleTheme, setThemePreference };
};
