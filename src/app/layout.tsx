import type { ReactNode } from 'react';

/**
 * Required because we keep `not-found.tsx` / `global-error.tsx` at the app root.
 * Real `<html>` / `<body>` live in `[locale]/layout.tsx` (next-intl pattern).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
