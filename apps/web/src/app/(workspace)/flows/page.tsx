'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StageHeader } from '@/components/StageHeader';
import { DisclaimerBar } from '@/components/DisclaimerBar';
import { Workflow, ExternalLink, RefreshCw, Zap } from 'lucide-react';

type Health = {
  configured: boolean;
  reachable: boolean;
  baseUrl: string;
  message: string;
  uiUrl?: string;
  mappedFlows?: Array<{ id: string; name: string; skillId?: string }>;
  skillCatalog?: string[];
};

export default function FlowsPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [testMsg, setTestMsg] = useState('How does FOIL work in New York?');
  const [testSkill, setTestSkill] = useState('foil-ny');
  const [runOut, setRunOut] = useState('');
  const [running, setRunning] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/plate/langflow/health');
      if (res.ok) setHealth(await res.json());
      else
        setHealth({
          configured: false,
          reachable: false,
          baseUrl: '',
          message: 'No pipeline is connected. The educational engine still answers from the on-device skill packs.',
        });
    } catch {
      setHealth({
        configured: false,
        reachable: false,
        baseUrl: '',
        message: 'No pipeline is connected. The educational engine still answers from the on-device skill packs.',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' && !process.env.NEXT_PUBLIC_API_URL) {
      setHealth({
        configured: false,
        reachable: false,
        baseUrl: '',
        message: 'No pipeline is connected. The educational engine still answers from the on-device skill packs.',
      });
      setLoading(false);
      return;
    }
    void load();
  }, []);

  async function runFlow() {
    setRunning(true);
    setRunOut('');
    try {
      const res = await fetch('/api/plate/langflow/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: testSkill, message: testMsg }),
      });
      const data = await res.json();
      setRunOut(JSON.stringify(data, null, 2));
    } catch (e) {
      setRunOut(String(e));
    } finally {
      setRunning(false);
    }
  }

  const uiUrl = health?.uiUrl || health?.baseUrl || 'http://localhost:7860';

  return (
    <div className="stack gap-lg">
      <StageHeader
        eyebrow="Module · Langflow"
        title="Visual Flow Studio"
        subtitle="Operator surface for visual agent pipelines. Public answers do not depend on it — the engine, FOIL draft, and officer lookup run without a pipeline."
        actions={
          <>
            <button type="button" className="btn" onClick={() => void load()} disabled={loading}>
              <RefreshCw size={14} />
              {loading ? 'Checking…' : 'Refresh'}
            </button>
            {health?.reachable ? (
              <a className="btn btn-primary" href={uiUrl} target="_blank" rel="noreferrer">
                Open pipeline studio
                <ExternalLink size={14} />
              </a>
            ) : (
              <Link href="/engine" className="btn btn-primary">
                Open the engine
              </Link>
            )}
          </>
        }
      />

      <DisclaimerBar />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <div className="panel">
          <div className="panel-header">
            <div className="row gap-sm">
              <Workflow size={16} color="var(--cyan)" />
              <span className="mono" style={{ fontSize: '0.8rem' }}>
                CONNECTION
              </span>
            </div>
            <span className={`badge ${health?.reachable ? '' : 'badge-amber'}`}>
              {loading ? 'Checking…' : health?.reachable ? 'Reachable' : 'Offline'}
            </span>
          </div>
          <div className="panel-body stack">
            <div className="data-row" style={{ gridTemplateColumns: '1fr' }}>
              <span className="dim mono" style={{ fontSize: '0.72rem' }}>
                BASE URL
              </span>
              <code className="mono" style={{ color: 'var(--cyan)' }}>
                {health?.baseUrl || '—'}
              </code>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              {health?.message || '—'}
            </p>
            {health?.reachable ? (
              <p className="dim" style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5 }}>
                Studio: <code className="mono">{uiUrl}</code>
              </p>
            ) : (
              <p className="dim" style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5 }}>
                Operators connect a pipeline from the API host. Visitors can keep working in the engine.
              </p>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="row gap-sm">
              <Zap size={16} color="var(--amber)" />
              <span className="mono" style={{ fontSize: '0.8rem' }}>
                SKILL → FLOW MAP
              </span>
            </div>
          </div>
          <div className="panel-body stack gap-sm">
            {(health?.mappedFlows?.length ? health.mappedFlows : []).map((f) => (
              <div key={f.id + (f.skillId || '')} className="data-row">
                <span className="mono" style={{ color: 'var(--cyan)' }}>
                  {f.skillId}
                </span>
                <span className="dim mono" style={{ fontSize: '0.75rem' }}>
                  {f.id.slice(0, 12)}…
                </span>
              </div>
            ))}
            {!health?.mappedFlows?.length ? (
              <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>
                No pipelines are mapped. The skill packs still answer in the engine.
              </p>
            ) : null}
            <div className="row-wrap">
              {(health?.skillCatalog || ['foil-ny', 'ccrb-open-data', 'research-start']).map((id) => (
                <span key={id} className="badge badge-violet">
                  {id}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <span className="mono" style={{ fontSize: '0.8rem' }}>
            RUN FLOW (TEST)
          </span>
        </div>
        <div className="panel-body stack">
          <label className="stack gap-sm">
            <span className="dim mono" style={{ fontSize: '0.72rem' }}>
              SKILL ID
            </span>
            <input className="input" value={testSkill} onChange={(e) => setTestSkill(e.target.value)} />
          </label>
          <label className="stack gap-sm">
            <span className="dim mono" style={{ fontSize: '0.72rem' }}>
              MESSAGE
            </span>
            <textarea
              className="textarea"
              value={testMsg}
              onChange={(e) => setTestMsg(e.target.value)}
            />
          </label>
          <button
            className="btn btn-primary"
            type="button"
            disabled={running || !health?.reachable}
            onClick={() => void runFlow()}
          >
            {running ? 'Running…' : health?.reachable ? 'Run pipeline' : 'Pipeline offline'}
          </button>
          {runOut ? (
            <pre
              className="mono"
              style={{
                margin: 0,
                fontSize: '0.75rem',
                whiteSpace: 'pre-wrap',
                color: 'var(--text-muted)',
                maxHeight: 280,
                overflow: 'auto',
              }}
            >
              {runOut}
            </pre>
          ) : null}
        </div>
      </div>

    </div>
  );
}
