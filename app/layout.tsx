import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title:       'Algorithm Fundamentals – Repaso interactivo',
  description: 'Plataforma de entrenamiento en algoritmia: recursión, iteración y vuelta atrás',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <Header />
          <main className="min-h-[calc(100vh-3.5rem)]">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
