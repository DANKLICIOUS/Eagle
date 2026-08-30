'use client';

type Props = {
  size?: number;
  label?: string;
};

export function AiCore({ size = 180, label = 'EAGLE CORE ONLINE' }: Props) {
  return (
    <div className="stack" style={{ alignItems: 'center', gap: 14 }}>
      <div className="ai-core" style={{ width: size, height: size }} aria-hidden>
        <div className="ai-core-ring" />
        <div className="ai-core-ring" />
        <div className="ai-core-ring" />
        <div className="ai-core-orb" />
      </div>
      {label ? (
        <div className="badge" style={{ letterSpacing: '0.12em' }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--success)',
              boxShadow: '0 0 8px var(--success)',
            }}
          />
          {label}
        </div>
      ) : null}
    </div>
  );
}
