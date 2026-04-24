import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title:       'FAL Study – Repaso interactivo',
  description: 'Aplicación de estudio con tarjetas, exámenes y repetición espaciada',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-88EFM0DKZ6" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-88EFM0DKZ6');
        `}</Script>
      </head>
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
