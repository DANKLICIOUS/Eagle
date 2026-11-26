import type { ReactNode } from 'react';
import { NavRail } from '@/components/NavRail';
import { ConsentGate } from '@/components/ConsentGate';
import { AnieAssistant } from '@/components/AnieAssistant';

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <>
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
    </>
  );
}
