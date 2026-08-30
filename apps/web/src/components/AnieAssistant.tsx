'use client';

/**
 * Floating AI Legal Assistant panel — visual reference: info.ufo "Anie" chat rail.
 * Educational framing only (not legal advice).
 */

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import {
  createUserMessage,
  generateEngineReply,
  type ChatMessage,
} from '@/lib/ai-engine';
import { Bot, Loader2, Send, Sparkles, X } from 'lucide-react';

const TOPIC_CHIPS = [
  { label: '4th Amendment', prompt: 'Explain the Fourth Amendment in plain language (education only)' },
  { label: 'Due Process', prompt: 'Build a research roadmap for due process concepts (leads only)' },
  { label: 'Self Representation', prompt: 'How do I organize a case timeline for my notes?' },
  { label: 'Discovery Rights', prompt: 'How does FOIL work in New York?' },
];

export function AnieAssistant() {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  async function send(text: string) {
    const cleaned = text.trim();
    if (!cleaned || busy) return;
    const userMsg = createUserMessage(cleaned);
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setBusy(true);
    try {
      const reply = await generateEngineReply(cleaned, { surface: 'engine' });
      setMessages((m) => [...m, reply]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  if (!open) {
    return (
      <button
        type="button"
        className="anie-fab"
        onClick={() => setOpen(true)}
        aria-label="Open AI legal assistant"
      >
        <Bot size={22} />
      </button>
    );
  }

  return (
    <aside className="anie-panel panel" aria-label="AI Legal Assistant">
      <div className="panel-header">
        <div className="row gap-sm">
          <span className="anie-avatar" aria-hidden>
            <Bot size={16} />
          </span>
          <div>
            <div className="row gap-sm">
              <strong style={{ fontSize: '0.9rem' }}>AI Legal Assistant</strong>
              <span className="badge" style={{ fontSize: '0.65rem' }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--success)',
                    boxShadow: '0 0 8px var(--success)',
                  }}
                />
                Online
              </span>
            </div>
            <div className="dim mono" style={{ fontSize: '0.7rem', marginTop: 2 }}>
              Hi, I&apos;m Anie · educational only
            </div>
          </div>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="panel-body stack" style={{ paddingTop: 12 }}>
        <p className="muted" style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
          Your AI legal <em>research</em> assistant. Ask about case-law literacy, rights concepts, or
          procedures — not personal legal advice.
        </p>

        <div className="anie-stream">
          {messages.length === 0 ? (
            <div className="msg msg-ai" style={{ maxWidth: '100%', fontSize: '0.88rem' }}>
              <div className="msg-meta">
                <Sparkles size={12} /> Anie · Ready
              </div>
              Ask anything about educational legal process. Outputs are AI-generated and labeled.
            </div>
          ) : null}
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.role === 'user' ? 'msg msg-user' : 'msg msg-ai'}
              style={{ fontSize: '0.88rem', maxWidth: '100%' }}
            >
              <div className="msg-meta">
                {m.role === 'user' ? 'You' : 'Anie'}
                {m.skillId ? (
                  <span className="badge badge-violet" style={{ fontSize: '0.6rem' }}>
                    {m.skillId}
                    {m.mode ? ` · ${m.mode}` : ''}
                  </span>
                ) : null}
              </div>
              {m.content.slice(0, 600)}
              {m.content.length > 600 ? '…' : ''}
            </div>
          ))}
          {busy ? (
            <div className="row gap-sm muted" style={{ fontSize: '0.85rem' }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Thinking…
            </div>
          ) : null}
        </div>

        <div>
          <div className="dim mono" style={{ fontSize: '0.68rem', marginBottom: 8 }}>
            POPULAR TOPICS
          </div>
          <div className="row-wrap">
            {TOPIC_CHIPS.map((t) => (
              <button
                key={t.label}
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => void send(t.prompt)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="row" style={{ alignItems: 'stretch' }}>
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Anie anything…"
            aria-label="Ask Anie"
            disabled={busy}
          />
          <button className="btn btn-primary" type="submit" disabled={busy || !input.trim()}>
            <Send size={14} />
          </button>
        </form>

        <Link href="/engine" className="btn btn-ghost full" style={{ fontSize: '0.8rem' }}>
          Open full AI Engine
        </Link>
      </div>
    </aside>
  );
}
