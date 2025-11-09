
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export const useDarkMode = (): [Theme, () => void] => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    window.localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const localTheme = window.localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (localTheme) {
      setTheme(localTheme);
    } else if (prefersDark) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);

  return [theme, toggleTheme];
};
