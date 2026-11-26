import { StageHeader } from '@/components/StageHeader';
import { DisclaimerBar } from '@/components/DisclaimerBar';
import { DEMO_RESEARCH } from '@/lib/mock-data';
import { FileSearch } from 'lucide-react';

export default function ResearchPage() {
  return (
    <div className="stack gap-lg">
      <StageHeader
        eyebrow="Module · Research Desk"
        title="Public-Domain Research"
        subtitle="Browse educational summaries of public statutes and process notes with source attribution. No proprietary case-law dumps without license."
      />

      <DisclaimerBar />

      <div className="panel">
        <div className="panel-header">
          <div className="row gap-sm">
            <FileSearch size={16} color="var(--cyan)" />
            <span className="mono" style={{ fontSize: '0.8rem' }}>
              SOURCES // ATTRIBUTED
            </span>
          </div>
        </div>
        <div className="panel-body stack gap-sm">
          {DEMO_RESEARCH.map((item) => (
            <article key={item.id} className="data-row" style={{ gridTemplateColumns: '1fr' }}>
              <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>{item.title}</h3>
                {item.publicDomain ? (
                  <span className="badge badge-violet">Public domain / statute</span>
                ) : (
                  <span className="badge badge-amber">Licensed</span>
                )}
              </div>
              <p className="muted" style={{ margin: '10px 0 0', lineHeight: 1.55 }}>
                {item.summary}
              </p>
              <div className="dim mono" style={{ fontSize: '0.75rem', marginTop: 10 }}>
                Source: {item.source} · {item.jurisdiction} · {item.year}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
