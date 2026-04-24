'use client';

import { useEffect, type ReactNode } from 'react';
import { useStore } from '@/store/useStore';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useStore();

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  return <>{children}</>;
}
