'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  ChatMessage,
  STARTER_PROMPTS,
  createUserMessage,
  generateEngineReply,
  getSkillCatalog,
} from '@/lib/ai-engine';
import { DisclaimerBar } from '@/components/DisclaimerBar';
import { AiCore } from '@/components/AiCore';
import { Loader2, Send, Sparkles } from 'lucide-react';

function renderMarkdownLite(text: string) {
  return text.split('\n').map((line, idx) => (
    <span key={idx}>
      {idx > 0 ? <br /> : null}
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  ));
}

export function EngineChat({ compactCore = false }: { compactCore?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);
  const skills = getSkillCatalog();

  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  async function send(text: string) {
    const cleaned = text.trim();
    if (!cleaned || busy) return;

    const userMsg = createUserMessage(cleaned);
    const history = [...messages, userMsg]
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    setMessages((m) => [...m, userMsg]);
    setInput('');
    setBusy(true);
    try {
      const reply = await generateEngineReply(cleaned, {
        surface: 'engine',
        history: history.slice(0, -1),
      });
      setMessages((m) => [...m, reply]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <div className="stack gap-lg">
      {!compactCore && messages.length === 0 ? (
        <div className="stack" style={{ alignItems: 'center', padding: '12px 0 8px' }}>
          <AiCore size={160} />
          <p className="muted" style={{ textAlign: 'center', maxWidth: 520, margin: 0 }}>
            Immersive educational core online — skill packs adapted from{' '}
            <strong style={{ color: 'var(--text)' }}>claude-for-legal</strong> (clinic draft,
            research-start, chronology) with App Store educational framing.
          </p>
          <div className="row-wrap" style={{ justifyContent: 'center', maxWidth: 640 }}>
            {skills.map((s) => (
              <span key={s.id} className="badge badge-violet" title={s.source}>
                {s.id}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <DisclaimerBar variant="ai" />

      <div className="panel">
        <div className="panel-header">
          <div className="row gap-sm">
            <Sparkles size={16} color="var(--cyan)" />
            <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>
              ENGINE // SKILL-ROUTED CHANNEL
            </span>
          </div>
          <span className="badge badge-amber">Not legal advice · AI-generated</span>
        </div>
        <div className="panel-body stack">
          <div className="chat-stream" ref={streamRef} aria-live="polite">
            {messages.length === 0 ? (
              <div className="msg msg-ai" style={{ maxWidth: '100%' }}>
                <div className="msg-meta">
                  <span>Eagle Core</span>
                  <span>·</span>
                  <span>Ready</span>
                </div>
                Initialize a query or pick a starter prompt. Messages are routed to educational skill
                packs (FOIL, CCRB, research leads-not-authorities, chronology, constitutional
                literacy). Live LLM when API is up; otherwise static skill content.
              </div>
            ) : null}

            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'msg msg-user' : 'msg msg-ai'}>
                <div className="msg-meta">
                  <span>{m.role === 'user' ? 'You' : 'Eagle Core'}</span>
                  <span>·</span>
                  <span className="mono">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {m.role === 'assistant' ? (
                    <>
                      <span>·</span>
                      <span className="badge" style={{ fontSize: '0.65rem' }}>
                        AI-generated
                      </span>
                      {m.skillId ? (
                        <span className="badge badge-violet" style={{ fontSize: '0.65rem' }}>
                          {m.skillId}
                          {m.mode ? ` · ${m.mode}` : ''}
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </div>
                <div>{m.role === 'assistant' ? renderMarkdownLite(m.content) : m.content}</div>
                {m.sources?.length ? (
                  <div className="mt-sm">
                    <span className="badge badge-violet">Sources / provenance</span>
                    <ul
                      className="dim"
                      style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: '0.85rem' }}
                    >
                      {m.sources.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}

            {busy ? (
              <div className="msg msg-ai row gap-sm" style={{ width: 'fit-content' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span className="muted">Routing skill · synthesizing educational response…</span>
              </div>
            ) : null}
          </div>

          {messages.length === 0 ? (
            <div className="row-wrap">
              {STARTER_PROMPTS.map((p) => (
                <button key={p} type="button" className="btn btn-ghost" onClick={() => void send(p)}>
                  {p}
                </button>
              ))}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="row" style={{ alignItems: 'stretch' }}>
            <input
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask to understand process, records, or research steps…"
              aria-label="Message the AI engine"
              disabled={busy}
            />
            <button className="btn btn-primary" type="submit" disabled={busy || !input.trim()}>
              <Send size={16} />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
