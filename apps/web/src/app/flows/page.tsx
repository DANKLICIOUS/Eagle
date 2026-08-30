'use client';

import { useEffect, useState } from 'react';
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
          baseUrl: 'http://localhost:7860',
          message: 'API offline — start packages/api',
        });
    } catch {
      setHealth({
        configured: false,
        reachable: false,
        baseUrl: 'http://localhost:7860',
        message: 'Could not reach Eagle API',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
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
        subtitle="Wire educational skill packs into Langflow agent pipelines. Design multi-step FOIL, CCRB, and research flows visually — then run them from Eagle."
        actions={
          <>
            <button type="button" className="btn" onClick={() => void load()}>
              <RefreshCw size={14} />
              Refresh
            </button>
            <a className="btn btn-primary" href={uiUrl} target="_blank" rel="noreferrer">
              Open Langflow UI
              <ExternalLink size={14} />
            </a>
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
            <p className="dim" style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.5 }}>
              Start with Docker:{' '}
              <code className="mono">docker compose -f docker-compose.langflow.yml up</code> from the
              Eagle repo. Set <code className="mono">LANGFLOW_ENABLED=true</code> on the API.
            </p>
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
                No flow UUIDs mapped yet. Create flows in Langflow, then set env:
                <br />
                <code className="mono">LANGFLOW_FLOW_FOIL=&lt;uuid&gt;</code>
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
          <button className="btn btn-primary" type="button" disabled={running} onClick={() => void runFlow()}>
            {running ? 'Running…' : 'POST /api/langflow/run'}
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

      <div className="panel">
        <div className="panel-header">
          <span className="mono" style={{ fontSize: '0.8rem' }}>
            REFERENCE UX · INFO.UFO
          </span>
        </div>
        <div className="panel-body">
          <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
            Visual direction from your reference: holographic vault core, green accent security
            language, floating AI assistant rail (Anie), and multi-step access flow. Eagle implements
            the educational twin — vault + engine + skill packs + optional Langflow orchestration —
            without “defend and win” claims.
          </p>
        </div>
      </div>
    </div>
  );
}
