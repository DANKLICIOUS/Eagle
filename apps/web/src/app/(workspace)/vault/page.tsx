'use client';

import { useState } from 'react';
import { StageHeader } from '@/components/StageHeader';
import { DisclaimerBar } from '@/components/DisclaimerBar';
import { DEMO_VAULT, VaultItem } from '@/lib/mock-data';
import { FileImage, FileText, FolderLock, Lock, StickyNote, Video } from 'lucide-react';

const ICONS = {
  pdf: FileText,
  image: FileImage,
  note: StickyNote,
  video: Video,
};

export default function VaultPage() {
  const [items] = useState<VaultItem[]>(DEMO_VAULT);
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div className="stack gap-lg">
      <StageHeader
        eyebrow="Module · Secure Vault"
        title="Document Vault"
        subtitle="Organize evidence and notes with encryption-first UX. Demo mode stores nothing on a server — production will use device data protection and explicit opt-in for AI analysis."
      />

      <DisclaimerBar />

      <div className="vault-hero" aria-hidden>
        <div className="vault-door">
          <Lock size={36} color="var(--success)" />
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="row gap-sm">
            <FolderLock size={16} color="var(--cyan)" />
            <span className="mono" style={{ fontSize: '0.8rem' }}>
              VAULT // LOCAL-FIRST · SECURE · VERIFIED · PRIVATE
            </span>
          </div>
          <span className="badge">{unlocked ? 'Session unlocked' : 'Locked'}</span>
        </div>
        <div className="panel-body stack">
          {!unlocked ? (
            <div className="stack" style={{ alignItems: 'center', padding: '28px 12px' }}>
              <p className="muted" style={{ textAlign: 'center', maxWidth: 420, margin: 0 }}>
                Your documents are private. Demo vault only — production will use platform data
                protection. Eagle does not share vault contents without your opt-in for AI analysis.
              </p>
              <button className="btn btn-primary mt-md" onClick={() => setUnlocked(true)}>
                Unlock the vault (demo)
              </button>
            </div>
          ) : (
            <>
              <div className="disclaimer-bar">
                Demo vault only. Production will require biometric/passcode gate and offer delete-all
                data controls for privacy compliance.
              </div>
              <div className="stack gap-sm">
                {items.map((item) => {
                  const Icon = ICONS[item.kind];
                  return (
                    <div key={item.id} className="data-row">
                      <div className="row gap-sm">
                        <div className="module-icon" style={{ width: 36, height: 36 }}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          <div className="dim mono" style={{ fontSize: '0.75rem', marginTop: 2 }}>
                            {item.kind.toUpperCase()} · {item.sizeLabel} · updated {item.updatedAt}
                          </div>
                        </div>
                      </div>
                      <span className="badge">{item.encrypted ? 'Encrypted' : 'Plain'}</span>
                    </div>
                  );
                })}
              </div>
              <div className="row-wrap">
                <button className="btn" type="button" disabled title="Wire to file picker + encryption">
                  Add document
                </button>
                <button className="btn btn-amber" type="button" disabled>
                  AI analysis requires opt-in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
