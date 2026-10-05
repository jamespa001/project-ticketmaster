'use client';

import { useEffect } from 'react';

export function ThemeListener() {
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme');

      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Listen to custom event dispatched from Header ('themeChange')
    const handleThemeChange = () => {
      applyTheme();
    };

    // Listen to cross-tab storage changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'theme') {
        applyTheme();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  return null;
}
