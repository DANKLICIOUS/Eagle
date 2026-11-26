'use client';

import { StageHeader } from '@/components/StageHeader';
import { DisclaimerBar } from '@/components/DisclaimerBar';
import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  LEGAL_DISCLAIMER,
  PHRASE_SWAPS,
  loadConsent,
} from '@/lib/compliance';
import { getSkillCatalog } from '@/lib/ai-engine';
import { FOIL_PRO } from '@plate/skill-packs';
import { loadProUnlocked, loadTimer, saveTimer, setProUnlockedDemo } from '@/lib/foil-tracker';
import { useEffect, useState } from 'react';
import { Settings, Shield, Trash2, BrainCircuit, Timer } from 'lucide-react';

export default function SettingsPage() {
  const [consentAt, setConsentAt] = useState<string | null>(null);
  const [pro, setPro] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [hours, setHours] = useState<number>(FOIL_PRO.timer.defaultIntervalHours);

  useEffect(() => {
    const c = loadConsent();
    setConsentAt(c?.acceptedAt ?? null);
    setPro(loadProUnlocked());
    const t = loadTimer();
    setTimerOn(t.enabled);
    setHours(t.intervalHours);
  }, []);

  function persistTimer(nextOn: boolean, nextHours: number) {
    saveTimer({ enabled: nextOn, intervalHours: nextHours });
  }

  function clearLocalData() {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    localStorage.removeItem('eagle.vault.demo');
    localStorage.removeItem(FOIL_PRO.storage.cases);
    localStorage.removeItem(FOIL_PRO.storage.timer);
    localStorage.removeItem(FOIL_PRO.storage.pro);
    setConsentAt(null);
    window.location.reload();
  }

  return (
    <div className="stack gap-lg">
      <StageHeader
        eyebrow="System · Settings"
        title="Privacy & Compliance"
        subtitle="Controls and disclosures for educational use, AI processing, and data deletion."
      />

      <DisclaimerBar />

      <div className="panel">
        <div className="panel-header">
          <div className="row gap-sm">
            <Shield size={16} color="var(--cyan)" />
            <span className="mono" style={{ fontSize: '0.8rem' }}>
              LEGAL FRAMING
            </span>
          </div>
        </div>
        <div className="panel-body stack">
          <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
            {LEGAL_DISCLAIMER}
          </p>
          <p className="dim mono" style={{ margin: 0, fontSize: '0.75rem' }}>
            Consent version: {CONSENT_VERSION}
            {consentAt ? ` · Accepted ${new Date(consentAt).toLocaleString()}` : ' · Not yet accepted'}
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="row gap-sm">
            <Timer size={16} color="var(--amber)" />
            <span className="mono" style={{ fontSize: '0.8rem' }}>
              FOIL PRO · {FOIL_PRO.label.toUpperCase()}
            </span>
          </div>
          <span className="badge badge-amber">In-app purchase</span>
        </div>
        <div className="panel-body stack">
          <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
            {FOIL_PRO.blurb} {FOIL_PRO.label}.
          </p>
          <label className="row" style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={pro}
              onChange={(e) => {
                setProUnlockedDemo(e.target.checked);
                setPro(e.target.checked);
              }}
              style={{ accentColor: 'var(--cyan)' }}
            />
            <span>Unlock Pro (demo — replace with Apple IAP product {FOIL_PRO.productId})</span>
          </label>
          <label className="row" style={{ cursor: pro ? 'pointer' : 'not-allowed', opacity: pro ? 1 : 0.5 }}>
            <input
              type="checkbox"
              disabled={!pro}
              checked={timerOn}
              onChange={(e) => {
                setTimerOn(e.target.checked);
                persistTimer(e.target.checked, hours);
              }}
              style={{ accentColor: 'var(--cyan)' }}
            />
            <span>Scheduled research ticks (leads, not authorities)</span>
          </label>
          <label className="stack gap-sm">
            <span className="dim mono" style={{ fontSize: '0.75rem' }}>
              INTERVAL (HOURS) · {FOIL_PRO.timer.minIntervalHours}–{FOIL_PRO.timer.maxIntervalHours}
            </span>
            <input
              className="input"
              type="number"
              min={FOIL_PRO.timer.minIntervalHours}
              max={FOIL_PRO.timer.maxIntervalHours}
              disabled={!pro}
              value={hours}
              onChange={(e) => {
                const n = Number(e.target.value);
                setHours(n);
                persistTimer(timerOn, n);
              }}
            />
          </label>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="row gap-sm">
            <BrainCircuit size={16} color="var(--cyan)" />
            <span className="mono" style={{ fontSize: '0.8rem' }}>
              CLAUDE-FOR-LEGAL SKILL PACKS
            </span>
          </div>
        </div>
        <div className="panel-body stack gap-sm">
          <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Educational packs adapted from anthropics/claude-for-legal (clinic draft, research-start,
            chronology). SuperClaude is used only as a development framework, not at runtime.
          </p>
          {getSkillCatalog().map((s) => (
            <div key={s.id} className="data-row" style={{ gridTemplateColumns: '1fr' }}>
              <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <strong className="mono" style={{ color: 'var(--cyan)' }}>
                  {s.id}
                </strong>
                <span className="badge">v{s.version}</span>
              </div>
              <div style={{ marginTop: 6 }}>{s.title}</div>
              <p className="muted" style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>
                {s.description}
              </p>
              <div className="dim mono" style={{ fontSize: '0.72rem', marginTop: 6 }}>
                source: {s.source}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="row gap-sm">
            <Settings size={16} color="var(--cyan)" />
            <span className="mono" style={{ fontSize: '0.8rem' }}>
              PRIVACY POLICY (SUMMARY)
            </span>
          </div>
        </div>
        <div className="panel-body stack">
          <ul className="muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
            <li>Minimize collection; vault content is local-first by design.</li>
            <li>AI document analysis requires explicit opt-in before off-device processing.</li>
            <li>Public CCRB/open data queries do not require account creation in demo mode.</li>
            <li>You can delete local consent and demo data below.</li>
            <li>Production builds will link a full Privacy Policy URL in App Store metadata and in-app.</li>
          </ul>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="mono" style={{ fontSize: '0.8rem' }}>
            COPY AUDIT — RISKY → COMPLIANT
          </span>
        </div>
        <div className="panel-body stack gap-sm">
          {PHRASE_SWAPS.map((p) => (
            <div key={p.risky} className="data-row">
              <span className="muted" style={{ textDecoration: 'line-through', opacity: 0.7 }}>
                {p.risky}
              </span>
              <span className="badge">{p.compliant}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="row gap-sm">
            <Trash2 size={16} color="var(--rose)" />
            <span className="mono" style={{ fontSize: '0.8rem' }}>
              DELETE MY LOCAL DATA
            </span>
          </div>
        </div>
        <div className="panel-body stack">
          <p className="muted" style={{ margin: 0 }}>
            Clears educational consent and demo local keys, then reloads. Production will purge vault
            ciphertext and account data on request.
          </p>
          <button className="btn" type="button" onClick={clearLocalData} style={{ borderColor: 'rgba(255,77,106,0.4)' }}>
            Delete local data
          </button>
        </div>
      </div>
    </div>
  );
}
