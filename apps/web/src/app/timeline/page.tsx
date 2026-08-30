'use client';

import { useState } from 'react';
import { StageHeader } from '@/components/StageHeader';
import { DisclaimerBar } from '@/components/DisclaimerBar';
import { Clock3, Plus, Trash2 } from 'lucide-react';

type EventRow = {
  id: string;
  when: string;
  what: string;
  evidence: string;
};

function nid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function TimelinePage() {
  const [rows, setRows] = useState<EventRow[]>([
    {
      id: nid(),
      when: '',
      what: '',
      evidence: '',
    },
  ]);

  function addRow() {
    setRows((r) => [...r, { id: nid(), when: '', what: '', evidence: '' }]);
  }

  function update(id: string, patch: Partial<EventRow>) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function remove(id: string) {
    setRows((r) => (r.length === 1 ? r : r.filter((row) => row.id !== id)));
  }

  return (
    <div className="stack gap-lg">
      <StageHeader
        eyebrow="Module · Timeline Draft"
        title="Suggested Chronology"
        subtitle="Build an initial draft timeline of events for your own preparation. This is a suggested outline — not a filing and not a guarantee of preparedness."
      />

      <DisclaimerBar variant="ai" />

      <div className="panel">
        <div className="panel-header">
          <div className="row gap-sm">
            <Clock3 size={16} color="var(--cyan)" />
            <span className="mono" style={{ fontSize: '0.8rem' }}>
              DRAFT TIMELINE // HUMAN REVIEW REQUIRED
            </span>
          </div>
          <button className="btn btn-ghost" type="button" onClick={addRow}>
            <Plus size={14} />
            Add event
          </button>
        </div>
        <div className="panel-body stack">
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className="stack"
              style={{
                padding: 16,
                borderRadius: 14,
                border: '1px solid var(--border)',
                background: 'rgba(0,0,0,0.25)',
              }}
            >
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="badge">Event {idx + 1}</span>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => remove(row.id)}
                  aria-label="Remove event"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <input
                className="input"
                placeholder="Date / time (or approximate range)"
                value={row.when}
                onChange={(e) => update(row.id, { when: e.target.value })}
              />
              <textarea
                className="textarea"
                placeholder="What happened (facts only)"
                value={row.what}
                onChange={(e) => update(row.id, { what: e.target.value })}
              />
              <input
                className="input"
                placeholder="Evidence notes (video, witnesses, medical, etc.)"
                value={row.evidence}
                onChange={(e) => update(row.id, { evidence: e.target.value })}
              />
            </div>
          ))}
          <p className="dim" style={{ margin: 0, fontSize: '0.85rem' }}>
            Export and counsel-review hooks land next. Keep this draft private in Vault when ready.
          </p>
        </div>
      </div>
    </div>
  );
}
