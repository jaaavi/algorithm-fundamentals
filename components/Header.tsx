'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Moon, Sun, BookOpen, GraduationCap, Code2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/cn';

export function Header() {
  const { settings, setTheme } = useStore();
  const pathname = usePathname();

  const toggleTheme = () => setTheme(settings.theme === 'dark' ? 'light' : 'dark');

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white hover:opacity-80 transition-opacity">
          <BookOpen className="w-5 h-5 text-primary-600" />
          <span>FAL Study</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              pathname === '/'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
            )}
          >
            Inicio
          </Link>
          <Link
            href="/formacion"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/formacion')
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
            )}
          >
            <GraduationCap className="w-4 h-4" />
            Formación
          </Link>
          <Link
            href="/problemas"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/problemas')
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
            )}
          >
            <Code2 className="w-4 h-4" />
            Problemas
          </Link>
          <Link
            href="/stats"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              pathname === '/stats'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
            )}
          >
            <BarChart3 className="w-4 h-4" />
            Estadísticas
          </Link>

          <button
            onClick={toggleTheme}
            className="ml-2 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={settings.theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
