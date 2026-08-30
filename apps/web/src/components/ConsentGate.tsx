'use client';

import { useEffect, useState } from 'react';
import {
  CONSENT_VERSION,
  LEGAL_DISCLAIMER,
  loadConsent,
  saveConsent,
} from '@/lib/compliance';
import { Shield } from 'lucide-react';

export function ConsentGate() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setOpen(!loadConsent());
  }, []);

  if (!open) return null;

  function accept() {
    if (!checked) return;
    saveConsent({
      version: CONSENT_VERSION,
      acceptedAt: new Date().toISOString(),
      understoodNotLegalAdvice: true,
    });
    setOpen(false);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <div className="panel modal">
        <div className="panel-header">
          <div className="row gap-sm">
            <Shield size={18} color="var(--cyan)" />
            <span className="display" style={{ fontSize: '0.95rem' }} id="consent-title">
              Educational Access Protocol
            </span>
          </div>
          <span className="badge">Required</span>
        </div>
        <div className="panel-body stack">
          <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
            Eagle Intelligence is an <strong style={{ color: 'var(--text)' }}>educational</strong>{' '}
            legal information system. It helps you understand public records, FOIL process, and
            accountability data. It is <strong style={{ color: 'var(--amber)' }}>not</strong> a
            lawyer, does not guarantee outcomes, and does not file documents on your behalf.
          </p>
          <div className="disclaimer-bar">{LEGAL_DISCLAIMER}</div>
          <label
            className="row"
            style={{
              alignItems: 'flex-start',
              gap: 12,
              cursor: 'pointer',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'rgba(0,0,0,0.25)',
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              style={{ marginTop: 4, accentColor: 'var(--cyan)' }}
            />
            <span style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
              I understand this is <strong>not legal advice</strong>, not a substitute for a licensed
              attorney, and that AI outputs are educational only.
            </span>
          </label>
          <button className="btn btn-primary full" disabled={!checked} onClick={accept}>
            Enter Eagle Engine
          </button>
          <p className="dim mono" style={{ margin: 0, fontSize: '0.72rem', textAlign: 'center' }}>
            Consent version {CONSENT_VERSION} · Privacy controls in Settings
          </p>
        </div>
      </div>
    </div>
  );
}
