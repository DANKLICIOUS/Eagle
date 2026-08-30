import type { ReactNode } from 'react';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function StageHeader({ eyebrow, title, subtitle, actions }: Props) {
  return (
    <header
      className="row"
      style={{
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}
    >
      <div className="stack" style={{ gap: 6 }}>
        {eyebrow ? (
          <span className="badge" style={{ width: 'fit-content' }}>
            {eyebrow}
          </span>
        ) : null}
        <h1
          className="display"
          style={{
            margin: 0,
            fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
            letterSpacing: '0.08em',
          }}
        >
          <span className="glow-text">{title}</span>
        </h1>
        {subtitle ? (
          <p className="muted" style={{ margin: 0, maxWidth: 640, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="row-wrap">{actions}</div> : null}
    </header>
  );
}
