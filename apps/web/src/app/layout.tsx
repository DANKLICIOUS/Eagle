import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap';

export const metadata: Metadata = {
  metadataBase: new URL('https://sui-law.vercel.app'),
  title: {
    default: 'SUI — Legal sovereignty for the self-represented',
    template: '%s · SUI',
  },
  description:
    "sui juris — of one's own right. Search public officer records, prepare records requests, and learn the process. An educational workspace for people who represent themselves. Not a law firm and not legal advice.",
  openGraph: {
    title: 'SUI — Legal sovereignty for the self-represented',
    description: "sui juris — of one's own right. Built for people who represent themselves.",
    type: 'website',
    url: 'https://sui-law.vercel.app',
  },
  keywords: ['sui juris', 'SUI', 'FOIL', 'public records', 'pro se', 'CCRB', 'Eagle'],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONT_HREF} rel="stylesheet" />
      </head>
      <body>
        <Script id="sui-intro-gate" strategy="beforeInteractive">
          {`try{var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;var seen=sessionStorage.getItem('sui-intro')==='1';if(!reduce&&!seen)document.documentElement.classList.add('sui-hold');}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
