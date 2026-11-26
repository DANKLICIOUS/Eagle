'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import clsx from 'clsx';

const INTRO_KEY = 'sui-intro';

const BOLTS = Array.from({ length: 28 }, (_, i) => {
  const angle = i * ((2 * Math.PI) / 28) - Math.PI / 2;
  const radius = 44;
  return {
    left: `${(50 + radius * Math.cos(angle)).toFixed(3)}%`,
    top: `${(50 + radius * Math.sin(angle)).toFixed(3)}%`,
  };
});

const SPOKES = Array.from({ length: 8 }, (_, i) => i * 45);
const WHEEL_SPOKES = [0, 72, 144, 216, 288];

const GLYPHS = '§¶©®ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アイウエオカキクケコサシスセソタチツテト§¶USCCFRFOIL'.split(
  ''
);

const TERMINAL: Array<{ t: string; d: number; cls?: string }> = [
  { t: '> establishing secure channel ................ ', d: 26 },
  { t: 'OK\n', d: 0, cls: 'ok' },
  { t: '> jurisdiction ... resolving public-record statute\n', d: 20 },
  { t: "> credential ..... SUI JURIS / of one's own right\n", d: 20 },
  { t: '> access code .... ', d: 26 },
  { t: 'S U I – 0 4 4 7 1\n', d: 70, cls: 'ok' },
  { t: '\n> VAULT RELEASED — you represent yourself.\n', d: 34, cls: 'ok' },
];

const PHASES: Array<[number, string]> = [
  [0, 'rain'],
  [3400, 'code'],
  [7000, 'vault'],
  [11200, 'unlock'],
  [13400, 'open'],
  [15600, 'site'],
];

function trackSpecular(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
}

function ShieldMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2L4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4z" fill="url(#sui-shield)" />
      <defs>
        <linearGradient id="sui-shield" x1="4" y1="2" x2="20" y2="22">
          <stop stopColor="#f5e2ae" />
          <stop offset=".5" stopColor="#d8ad63" />
          <stop offset="1" stopColor="#8b6cff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PrismBackground({ active }: { active: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let teardown: (() => void) | null = null;
    let cancelled = false;

    import('./mount-prism')
      .then((mod) => {
        if (cancelled || !hostRef.current) return;
        try {
          teardown = mod.mountPrism(hostRef.current);
          hostRef.current.parentElement?.classList.add('has-prism');
        } catch (err) {
          console.warn('SUI prism: WebGL unavailable, keeping the still background', err);
        }
      })
      .catch((err) => {
        console.warn('SUI prism: failed to load', err);
      });

    return () => {
      cancelled = true;
      teardown?.();
      hostRef.current?.parentElement?.classList.remove('has-prism');
    };
  }, [active]);

  return <div id="prism" ref={hostRef} aria-hidden="true" />;
}

function CinemaIntro({
  done,
  onPhase,
  onFinish,
}: {
  done: boolean;
  onPhase: (phase: string) => void;
  onFinish: () => void;
}) {
  const rainRef = useRef<HTMLCanvasElement>(null);
  const onPhaseRef = useRef(onPhase);
  const onFinishRef = useRef(onFinish);
  onPhaseRef.current = onPhase;
  onFinishRef.current = onFinish;
  const [parts, setParts] = useState<Array<{ text: string; cls?: string }>>([]);

  useEffect(() => {
    let finished = false;
    const timers: number[] = [];
    let raf = 0;
    let running = false;
    const canvas = rainRef.current;
    const ctx = canvas?.getContext('2d') ?? null;
    let cols: Array<{ y: number; v: number; g: number }> = [];
    let columnWidth = 16;

    const stopRain = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const sizeRain = () => {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columnWidth = 16;
      const count = Math.ceil(window.innerWidth / columnWidth);
      cols = Array.from({ length: count }, () => ({
        y: Math.random() * -window.innerHeight,
        v: 2.2 + Math.random() * 5.4,
        g: Math.random(),
      }));
    };

    const drawRain = () => {
      if (!ctx) return;
      ctx.fillStyle = 'rgba(0,0,0,0.085)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = '600 14px "JetBrains Mono", ui-monospace, monospace';
      for (let c = 0; c < cols.length; c += 1) {
        const col = cols[c];
        const x = c * columnWidth;
        const head = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        ctx.fillStyle = col.g > 0.86 ? 'rgba(245,226,174,0.95)' : 'rgba(228,252,255,0.92)';
        ctx.fillText(head, x, col.y);
        ctx.fillStyle = col.g > 0.5 ? 'rgba(78,203,255,0.34)' : 'rgba(139,108,255,0.30)';
        ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], x, col.y - 16);
        ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], x, col.y - 32);
        col.y += col.v;
        if (col.y > window.innerHeight + 120) {
          col.y = Math.random() * -260;
          col.v = 2.2 + Math.random() * 5.4;
          col.g = Math.random();
        }
      }
      if (running) raf = requestAnimationFrame(drawRain);
    };

    const startRain = () => {
      if (running || !ctx) return;
      running = true;
      sizeRain();
      drawRain();
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      stopRain();
      timers.forEach((timer) => window.clearTimeout(timer));
      onFinishRef.current();
    };

    const onResize = () => {
      if (running) sizeRain();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        finish();
      }
    };

    startRain();
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);

    for (const [at, name] of PHASES) {
      timers.push(
        window.setTimeout(() => {
          if (finished) return;
          onPhaseRef.current(name);
          if (name === 'vault') stopRain();
          if (name === 'site') finish();
        }, at)
      );
    }

    timers.push(
      window.setTimeout(() => {
        if (finished) return;
        let stepIndex = 0;
        let charIndex = 0;
        const acc: Array<{ text: string; cls?: string }> = [];
        const step = () => {
          if (finished || stepIndex >= TERMINAL.length) return;
          const part = TERMINAL[stepIndex];
          if (charIndex === 0) acc.push({ text: '', cls: part.cls });
          if (charIndex < part.t.length) {
            const current = acc[acc.length - 1];
            acc[acc.length - 1] = { text: current.text + part.t[charIndex], cls: part.cls };
            charIndex += 1;
            setParts(acc.map((item) => ({ ...item })));
            timers.push(window.setTimeout(step, part.d));
          } else {
            stepIndex += 1;
            charIndex = 0;
            timers.push(window.setTimeout(step, 90));
          }
        };
        step();
      }, 3500)
    );

    return () => {
      finished = true;
      stopRain();
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div id="cinema" className={done ? 'done' : undefined} role="dialog" aria-label="Introduction">
      <canvas id="rain" ref={rainRef} />
      <div id="term">
        <div className="ln">
          {parts.map((part, index) =>
            part.cls ? (
              <span key={index} className={part.cls}>
                {part.text}
              </span>
            ) : (
              <span key={index}>{part.text}</span>
            )
          )}
        </div>
        <span className="cur" />
      </div>
      <div id="stage">
        <div className="vault">
          <div className="frame" />
          <div className="spill" />
          <div className="door">
            <div className="bolts">
              {BOLTS.map((bolt) => (
                <div key={`${bolt.left}-${bolt.top}`} className="bolt" style={bolt} />
              ))}
            </div>
            <div className="spokes">
              {SPOKES.map((deg) => (
                <div key={deg} className="spoke" style={{ transform: `rotate(${deg}deg)` }} />
              ))}
            </div>
            <div className="crest-sh" />
            <div className="crest" />
            <div className="wheel">
              {WHEEL_SPOKES.map((deg) => (
                <i key={deg} style={{ transform: `translate(-50%, -100%) rotate(${deg}deg)` }} />
              ))}
              <div className="hub" />
            </div>
          </div>
          <div className="rays" />
        </div>
      </div>
      <div className="fog">
        <i />
        <i />
        <i />
      </div>
      <div id="flash" />
      <div className="cine-grain" />
      <div className="vignette" />
      <button
        id="skip"
        type="button"
        onClick={() => {
          onPhase('site');
          onFinish();
        }}
      >
        Skip intro
      </button>
    </div>
  );
}

export function SuiLanding() {
  const [playIntro, setPlayIntro] = useState(false);
  const [revealed, setRevealed] = useState(true);
  const [phase, setPhase] = useState('');
  const [playKey, setPlayKey] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_KEY) === '1';
    } catch {
      seen = false;
    }
    if (reduce || seen) {
      document.documentElement.classList.remove('sui-hold');
      setRevealed(true);
      setPlayIntro(false);
      return;
    }
    setRevealed(false);
    setPlayIntro(true);
  }, []);

  useEffect(() => {
    const lock = playIntro && !revealed;
    document.body.style.overflow = lock ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [playIntro, revealed]);

  function finishIntro() {
    document.documentElement.classList.remove('sui-hold');
    setRevealed(true);
    setPhase('site');
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* private mode */
    }
    window.setTimeout(() => setPlayIntro(false), 1200);
  }

  function replay(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    document.documentElement.classList.add('sui-hold');
    setRevealed(false);
    setPhase('');
    setPlayKey((key) => key + 1);
    setPlayIntro(true);
  }

  function closeNav() {
    setNavOpen(false);
  }

  return (
    <div className={clsx('sui-root', playIntro && !revealed && 'cinema-live')} data-phase={phase || undefined}>
      {playIntro ? (
        <CinemaIntro key={playKey} done={revealed} onPhase={setPhase} onFinish={finishIntro} />
      ) : null}

      <div id="site" className={revealed ? 'revealed' : undefined}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div className="bg-layer">
          <PrismBackground active={revealed} />
        </div>
        <div className="bg-tint" />
        <div className="bg-grain" />
        <div className="scanlines" />

        <nav>
          <Link href="/" className="brand brand-link">
            <ShieldMark />
            SUI<span className="tld">.law</span>
          </Link>
          <button
            id="burger"
            type="button"
            aria-expanded={navOpen}
            aria-controls="navlinks"
            aria-label="Menu"
            onClick={() => setNavOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className={clsx('navlinks', navOpen && 'open')} id="navlinks" onClick={closeNav}>
            <Link href="/officers">OFFICER LOOKUP</Link>
            <Link href="/foil">RECORDS REQUEST</Link>
            <Link href="/engine">ENGINE</Link>
            <a href="#metrics">METRICS</a>
            <a href="#about">ABOUT</a>
          </div>
          <Link href="/command" className="btn btn-ghost nav-cta">
            Enter workspace
          </Link>
        </nav>

        <header className="hero" id="main">
          <div className="eyebrow">sui juris · of one&apos;s own right</div>
          <h1>
            Legal sovereignty
            <br />
            <span className="accent">for the self-represented.</span>
          </h1>
          <p className="latin">— pro se litigants, armed with public record —</p>
          <p className="sub">
            Search public officer records. Prepare a New York FOIL draft you file yourself. Read the
            response windows before you send anything. SUI is the public face of the Eagle workspace —
            education, not representation.
          </p>
          <div className="cta-row">
            <Link href="/foil" className="btn btn-primary">
              Prepare a request
            </Link>
            <Link href="/officers" className="btn btn-ghost">
              Search officers
            </Link>
            <Link href="/engine" className="btn btn-ghost">
              Open the engine
            </Link>
          </div>
        </header>

        <div className="deck-lead">
          <p className="latin">The instruments</p>
          <p className="sub">
            A draft you send, a public index you read, and the statutory clocks you keep. Each card opens
            the live workspace.
          </p>
        </div>

        <section className="deck">
          <div className="holo-card" id="foil" style={{ animationDelay: '.75s' }} onPointerMove={trackSpecular}>
            <div className="card-head">
              <span className="dot" />
              <span>Records Request — Draft</span>
            </div>
            <div className="panel-title">Prepare a public records request</div>
            <div className="doc-paper">
              <div className="doc-title">Freedom of Information Request</div>
              <div className="doc-line w80" />
              <div className="doc-line w60" />
              <div className="doc-line w40" />
              <br />
              <div className="doc-line w90" />
              <div className="doc-line w70" />
              <div className="doc-line w50" />
              <div className="doc-line w80" />
              <div className="doc-line w60" />
            </div>
            <div className="panel-copy" style={{ paddingTop: 0 }}>
              Eagle interviews you, then prepares a New York FOIL draft you file yourself. Statutes differ by
              agency — city OpenRecords, the MTA, and NYPD special desks are not the same letter. Nothing here
              is filed for you, and nothing is legal advice.
            </div>
            <div className="foot-btn">
              <Link href="/foil" className="btn btn-ghost" style={{ width: '100%' }}>
                Prepare a request →
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div className="holo-card" id="lookup" style={{ animationDelay: '.9s' }} onPointerMove={trackSpecular}>
              <div className="card-head">
                <span className="dot" />
                <span>Officer Record · sample</span>
              </div>
              <div className="officer-row">
                <div className="avatar">
                  <svg viewBox="0 0 56 56" aria-hidden="true">
                    <circle cx="28" cy="20" r="10" fill="#495066" />
                    <path d="M8 52c2-14 12-20 20-20s18 6 20 20" fill="#495066" />
                  </svg>
                </div>
                <div>
                  <div className="officer-name">How a public record is read</div>
                  <div className="officer-meta">ILLUSTRATION · NOT A PERSON</div>
                </div>
              </div>
              <div className="badge-row" style={{ padding: '0 18px 10px' }}>
                <span className="badge warn">Sample disposition</span>
                <span className="badge">Public-source fields</span>
                <span className="badge">You read the source</span>
              </div>
              <div className="disposition">
                Every claim in the workspace carries its disposition. <em>Filed</em> is not <em>substantiated</em>{' '}
                and neither is a criminal verdict. The lookup opens the educational index.
              </div>
              <div className="foot-btn">
                <Link href="/officers" className="btn btn-ghost" style={{ width: '100%' }}>
                  Open officer lookup →
                </Link>
              </div>
            </div>

            <div className="holo-card" id="metrics" style={{ animationDelay: '1.05s' }} onPointerMove={trackSpecular}>
              <div className="card-head">
                <span className="dot" />
                <span>New York FOIL · the clocks</span>
              </div>
              <div className="stat-grid">
                <div className="stat-box a">
                  <div className="label">Acknowledge</div>
                  <div className="num">5</div>
                  <div className="label">business days</div>
                </div>
                <div className="stat-box b">
                  <div className="label">Appeal</div>
                  <div className="num">30</div>
                  <div className="label">calendar days</div>
                </div>
                <div className="stat-box c">
                  <div className="label">Statute</div>
                  <div className="num" style={{ fontSize: 22 }}>
                    Art. 6
                  </div>
                  <div className="label">Public Officers Law</div>
                </div>
                <div className="stat-box">
                  <div className="label">Filed for you</div>
                  <div className="num" style={{ color: 'var(--gold)' }}>
                    0
                  </div>
                  <div className="label">you send the letter</div>
                </div>
              </div>
              <div className="panel-copy" style={{ paddingTop: 0 }}>
                These are the statutory windows, not a dashboard of other people’s cases. The agency
                generally has five business days to acknowledge. A denial must state the reason. You
                generally have thirty calendar days to appeal to a different appeals officer.
              </div>
              <div className="foot-btn" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/foil" className="btn btn-ghost">
                  Prepare a request
                </Link>
                <Link href="/research" className="btn btn-ghost">
                  Research desk
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer id="about">
          <span>SUI · sui.law — built on public record.</span>
          <span>
            <button id="replay" type="button" onClick={replay}>
              Replay intro
            </button>
          </span>
          <p className="disclaimer">
            sui.law is an information tool, not a law firm, and nothing here is legal advice. The officer
            card is an illustration and describes no real person. The clocks above are the general New York
            FOIL windows — confirm them against the statute and the agency’s letter. Eagle prepares drafts.
            You file. A lawsuit is optional, slow, and costly.
          </p>
        </footer>
      </div>
    </div>
  );
}
