import type { Metadata } from 'next';
import './globals.css';
import { NavRail } from '@/components/NavRail';
import { ConsentGate } from '@/components/ConsentGate';
import { AnieAssistant } from '@/components/AnieAssistant';

export const metadata: Metadata = {
  title: 'Eagle Intelligence — Educational Legal Engine',
  description:
    'Immersive AI engine for educational legal information, public records research, FOIL learning, and secure document organization. Not a substitute for a licensed attorney.',
  keywords: [
    'legal education',
    'FOIL',
    'CCRB',
    'public records',
    'pro se education',
    'Eagle Intelligence',
  ],
};

export default function RootLayout({ children }: { children: import('react').ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="space-bg" aria-hidden />
        <div className="grid-floor" aria-hidden />
        <div className="scanlines" aria-hidden />
        <div className="app-shell">
          <NavRail />
          <div className="main-stage">
            <div className="stage-content">{children}</div>
          </div>
        </div>
        <ConsentGate />
        <AnieAssistant />
      </body>
    </html>
  );
}
