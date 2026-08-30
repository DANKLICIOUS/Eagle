/**
 * Eagle AI Engine — skill-routed educational replies.
 * Skills adapted from anthropics/claude-for-legal (clinic + litigation).
 * Production: prefers POST /api/agent/chat; falls back to static skill packs.
 */

import {
  type AgentChatResponse,
  type SkillModule,
  CONSENT_VERSION,
  generateStaticSkillReply,
  listSkills,
  pickPrimarySkill,
} from '@plate/skill-packs';

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  sources?: string[];
  skillId?: string;
  skillTitle?: string;
  mode?: AgentChatResponse['mode'];
  provenance?: string[];
};

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createUserMessage(content: string): ChatMessage {
  return {
    id: uid(),
    role: 'user',
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };
}

function toAssistantMessage(res: AgentChatResponse): ChatMessage {
  return {
    id: uid(),
    role: 'assistant',
    content: res.content,
    createdAt: new Date().toISOString(),
    sources: res.sources,
    skillId: res.skillId,
    skillTitle: res.skillTitle,
    mode: res.mode,
    provenance: res.provenance,
  };
}

/**
 * Resolve API base: Next rewrite `/api/plate/*` → backend, or direct URL.
 */
function apiBase(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  return process.env.NEXT_PUBLIC_API_URL || '';
}

export async function generateEngineReply(
  userText: string,
  options?: {
    surface?: SkillModule;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }
): Promise<ChatMessage> {
  const surface = options?.surface ?? 'engine';
  const history = options?.history ?? [];

  // Prefer live agent when API is reachable
  try {
    const base = apiBase();
    const url = base ? `${base.replace(/\/$/, '')}/api/agent/chat` : '/api/plate/agent/chat';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        surface,
        consentVersion: CONSENT_VERSION,
        history,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as AgentChatResponse;
      return toAssistantMessage(data);
    }
  } catch {
    // fall through to static skill packs
  }

  // Simulated latency for immersive offline feel
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 500));
  const staticRes = generateStaticSkillReply(userText, surface);
  return toAssistantMessage(staticRes);
}

export function getActiveSkillPreview(userText: string, surface: SkillModule = 'engine') {
  return pickPrimarySkill(userText, surface);
}

export function getSkillCatalog() {
  return listSkills();
}

export const STARTER_PROMPTS = [
  'How does FOIL work in New York?',
  'What is CCRB public data?',
  'How do I organize a case timeline?',
  'Build a research roadmap for FOIL (leads only)',
  'Explain the Fourth Amendment in plain language (education only)',
];

export { CONSENT_VERSION, listSkills };
