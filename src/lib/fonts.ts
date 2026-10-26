import { Playfair_Display, JetBrains_Mono, Inter_Tight } from 'next/font/google';

export const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  weight: 'variable',
  variable: '--font-playfair',
  display: 'swap',
});

export const jetbrains = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const interTight = Inter_Tight({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-inter-tight',
  display: 'swap',
});

export const fontVariables = `${playfair.variable} ${jetbrains.variable} ${interTight.variable}`;
