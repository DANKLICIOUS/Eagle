import Link from 'next/link';
import { StageHeader } from '@/components/StageHeader';
import { AiCore } from '@/components/AiCore';
import { DisclaimerBar } from '@/components/DisclaimerBar';
import { MODULES } from '@/lib/compliance';
import {
  BrainCircuit,
  Building2,
  Clock3,
  FileSearch,
  FolderLock,
  Scale,
  ArrowRight,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  engine: BrainCircuit,
  vault: FolderLock,
  officers: Building2,
  foil: Scale,
  research: FileSearch,
  timeline: Clock3,
  flows: Workflow,
};

export default function CommandDeckPage() {
  return (
    <div className="stack gap-lg">
      <StageHeader
        eyebrow="Eagle Intelligence · Ecosystem"
        title="Command Deck"
        subtitle="Hyper-interactive educational AI engine for public records literacy, FOIL process learning, and secure research workflows — not legal representation."
        actions={
          <Link href="/engine" className="btn btn-primary">
            Enter AI Engine
            <ArrowRight size={16} />
          </Link>
        }
      />

      <DisclaimerBar />

      <section
        className="panel"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 280px) 1fr',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <div className="panel-body" style={{ display: 'grid', placeItems: 'center' }}>
          <AiCore size={200} label="CORE // STANDBY" />
        </div>
        <div className="panel-body stack">
          <h2 className="display" style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '0.1em' }}>
            Immersive AI Ecosystem
          </h2>
          <p className="muted" style={{ margin: 0, lineHeight: 1.65, maxWidth: 560 }}>
            Six connected modules orbit the Eagle Core: conversational education, encrypted vault,
            public officer accountability lookup, FOIL draft builder, research desk, and timeline
            drafting. Every surface is framed as <strong style={{ color: 'var(--text)' }}>learning
            and organization</strong> — never guaranteed outcomes.
          </p>
          <div className="row-wrap">
            <span className="badge">AI-labeled outputs</span>
            <span className="badge badge-amber">Educational only</span>
            <span className="badge badge-violet">Public-domain sources</span>
          </div>
          <div className="row-wrap mt-sm">
            <Link href="/engine" className="btn btn-primary">
              Launch Engine
            </Link>
            <Link href="/vault" className="btn">
              Open Vault
            </Link>
            <Link href="/officers" className="btn btn-ghost">
              Officer Lookup
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 className="display" style={{ margin: 0, fontSize: '0.95rem', letterSpacing: '0.12em' }}>
            Modules
          </h2>
          <span className="mono dim" style={{ fontSize: '0.75rem' }}>
            SELECT INTERFACE
          </span>
        </div>
        <div className="module-grid">
          {MODULES.map((mod) => {
            const Icon = ICONS[mod.id] ?? BrainCircuit;
            return (
              <Link key={mod.id} href={mod.href} className="module-card">
                <div className="module-icon">
                  <Icon size={18} />
                </div>
                <div>
                  <div className="display" style={{ fontSize: '0.85rem', letterSpacing: '0.08em' }}>
                    {mod.title}
                  </div>
                  <div className="mono" style={{ color: 'var(--cyan)', fontSize: '0.72rem', marginTop: 4 }}>
                    {mod.tagline}
                  </div>
                </div>
                <p className="muted" style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5, flex: 1 }}>
                  {mod.description}
                </p>
                <span className="row gap-sm" style={{ color: 'var(--cyan)', fontSize: '0.82rem', fontWeight: 600 }}>
                  Open <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <style>{`
        @media (max-width: 780px) {
          section.panel {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
