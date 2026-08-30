'use client';

import { useMemo, useState } from 'react';
import { StageHeader } from '@/components/StageHeader';
import { DisclaimerBar } from '@/components/DisclaimerBar';
import { DEMO_OFFICERS } from '@/lib/mock-data';
import { Search } from 'lucide-react';

export default function OfficersPage() {
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return DEMO_OFFICERS;
    return DEMO_OFFICERS.filter((o) =>
      [o.firstName, o.lastName, o.badgeNumber, o.precinct, o.rank]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }, [q]);

  return (
    <div className="stack gap-lg">
      <StageHeader
        eyebrow="Module · Public Accountability"
        title="Officer Lookup"
        subtitle="Search demo public-style CCRB accountability records. Production connects to NYC Open Data. Outcomes here are agency dispositions — not criminal verdicts."
      />

      <DisclaimerBar />

      <div className="panel">
        <div className="panel-header">
          <div className="row gap-sm">
            <Search size={16} color="var(--cyan)" />
            <span className="mono" style={{ fontSize: '0.8rem' }}>
              OPEN DATA // EDUCATIONAL INDEX
            </span>
          </div>
          <span className="badge badge-violet">Public domain sources</span>
        </div>
        <div className="panel-body stack">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, badge, or precinct…"
            aria-label="Search officers"
          />

          <div className="stack gap-sm">
            {results.map((o) => (
              <article key={o.taxId} className="data-row" style={{ gridTemplateColumns: '1fr' }}>
                <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                      {o.firstName} {o.lastName}
                    </div>
                    <div className="dim mono" style={{ fontSize: '0.78rem', marginTop: 4 }}>
                      Badge {o.badgeNumber} · Pct {o.precinct} · {o.rank}
                    </div>
                  </div>
                  <div className="row-wrap">
                    <span className="badge">Total {o.totalAllegations}</span>
                    <span className="badge badge-amber">Active {o.active}</span>
                    <span className="badge badge-violet">Substantiated {o.substantiated}</span>
                  </div>
                </div>
                <p className="muted" style={{ margin: '10px 0 0', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  Educational view of public complaint counts. Use FOIL Builder to learn how to request
                  underlying agency records. This card does not allege criminal guilt.
                </p>
              </article>
            ))}
            {results.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                No demo matches. Try a different name or badge.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
