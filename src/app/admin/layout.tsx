import type { Metadata } from 'next';
import { fontVariables } from '@/lib/fonts';
import { fontFamily } from '@/lib/theme';
import '../globals.css';

export const metadata: Metadata = {
  title: { default: 'Panel administracyjny', template: '%s · Panel administracyjny' },
  robots: { index: false, follow: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={fontVariables} style={{ fontFamily: fontFamily.sans, background: '#0B0A08', color: '#F2ECDD', margin: 0 }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
