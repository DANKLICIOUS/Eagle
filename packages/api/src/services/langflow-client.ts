import { config } from '../config';

/**
 * Langflow HTTP client for Eagle.
 * Spec: POST /api/v1/run/{flow_id} with x-api-key (docs.langflow.org)
 *
 * Security: only call private Langflow instances; pin >= 1.9.x; never expose
 * unauthenticated public-build endpoints to the internet.
 */

export type LangflowRunResult = {
  ok: boolean;
  text: string;
  raw?: unknown;
  error?: string;
  flowId: string;
  latencyMs: number;
};

export type LangflowHealth = {
  configured: boolean;
  reachable: boolean;
  baseUrl: string;
  message: string;
};

export type LangflowFlowSummary = {
  id: string;
  name: string;
  description?: string;
  skillId?: string;
};

/** Map Eagle skill packs → Langflow flow IDs (env or defaults). */
export function skillFlowMap(): Record<string, string> {
  const fromEnv = config.langflow.skillFlowMap;
  return {
    'foil-ny': fromEnv['foil-ny'] || process.env.LANGFLOW_FLOW_FOIL || '',
    'ccrb-open-data': fromEnv['ccrb-open-data'] || process.env.LANGFLOW_FLOW_CCRB || '',
    'research-start': fromEnv['research-start'] || process.env.LANGFLOW_FLOW_RESEARCH || '',
    chronology: fromEnv.chronology || process.env.LANGFLOW_FLOW_CHRONOLOGY || '',
    'constitutional-edu':
      fromEnv['constitutional-edu'] || process.env.LANGFLOW_FLOW_CONSTITUTIONAL || '',
    'educational-qa': fromEnv['educational-qa'] || process.env.LANGFLOW_FLOW_DEFAULT || '',
  };
}

export class LangflowClient {
  static isConfigured(): boolean {
    return Boolean(config.langflow.enabled && config.langflow.baseUrl);
  }

  static async health(): Promise<LangflowHealth> {
    const baseUrl = config.langflow.baseUrl || 'http://localhost:7860';
    if (!config.langflow.enabled) {
      return {
        configured: false,
        reachable: false,
        baseUrl,
        message: 'Langflow integration disabled (set LANGFLOW_ENABLED=true)',
      };
    }

    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 4000);
      // Prefer health-ish endpoints; fall back to root
      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/health`, {
        signal: controller.signal,
      }).catch(() =>
        fetch(`${baseUrl.replace(/\/$/, '')}/`, { signal: controller.signal })
      );
      clearTimeout(t);
      return {
        configured: true,
        reachable: Boolean(res && (res.ok || res.status < 500)),
        baseUrl,
        message: res?.ok
          ? 'Langflow reachable'
          : `Langflow responded with status ${res?.status ?? 'unknown'}`,
      };
    } catch (e) {
      return {
        configured: true,
        reachable: false,
        baseUrl,
        message: e instanceof Error ? e.message : 'Unreachable',
      };
    }
  }

  /**
   * Run a flow by ID with a chat-style input_value.
   * @see https://docs.langflow.org/api-flows-run
   */
  static async runFlow(
    flowId: string,
    inputValue: string,
    options?: {
      sessionId?: string;
      tweaks?: Record<string, unknown>;
      outputType?: string;
      inputType?: string;
    }
  ): Promise<LangflowRunResult> {
    const started = Date.now();
    if (!flowId) {
      return {
        ok: false,
        text: '',
        flowId,
        latencyMs: 0,
        error: 'No Langflow flow_id configured for this skill',
      };
    }
    if (!this.isConfigured()) {
      return {
        ok: false,
        text: '',
        flowId,
        latencyMs: 0,
        error: 'Langflow not configured',
      };
    }

    const base = config.langflow.baseUrl.replace(/\/$/, '');
    const url = `${base}/api/v1/run/${encodeURIComponent(flowId)}?stream=false`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.langflow.apiKey) {
      headers['x-api-key'] = config.langflow.apiKey;
    }

    const body = {
      input_value: inputValue,
      input_type: options?.inputType || 'chat',
      output_type: options?.outputType || 'chat',
      session_id: options?.sessionId,
      tweaks: options?.tweaks || {},
    };

    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), config.langflow.timeoutMs);
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(t);

      const raw = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          ok: false,
          text: '',
          raw,
          flowId,
          latencyMs: Date.now() - started,
          error: `Langflow HTTP ${res.status}: ${JSON.stringify(raw).slice(0, 300)}`,
        };
      }

      const text = extractLangflowText(raw);
      return {
        ok: true,
        text,
        raw,
        flowId,
        latencyMs: Date.now() - started,
      };
    } catch (e) {
      return {
        ok: false,
        text: '',
        flowId,
        latencyMs: Date.now() - started,
        error: e instanceof Error ? e.message : 'Langflow request failed',
      };
    }
  }

  static async runSkillFlow(
    skillId: string,
    inputValue: string,
    sessionId?: string
  ): Promise<LangflowRunResult> {
    const map = skillFlowMap();
    const flowId = map[skillId] || map['educational-qa'] || '';
    return this.runFlow(flowId, inputValue, { sessionId });
  }

  /** Catalog of mapped Eagle skill → flow (for UI). */
  static listMappedFlows(): LangflowFlowSummary[] {
    const map = skillFlowMap();
    return Object.entries(map)
      .filter(([, id]) => Boolean(id))
      .map(([skillId, id]) => ({
        id,
        name: `Eagle · ${skillId}`,
        skillId,
        description: `Langflow flow bound to skill pack ${skillId}`,
      }));
  }
}

/** Best-effort text extraction from Langflow run responses (schema varies by version). */
export function extractLangflowText(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  const r = raw as Record<string, unknown>;

  // Common: outputs[0].outputs[0].results.message.text
  try {
    const outputs = r.outputs as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(outputs) && outputs[0]) {
      const inner = outputs[0].outputs as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(inner) && inner[0]) {
        const results = inner[0].results as Record<string, unknown> | undefined;
        const message = results?.message as Record<string, unknown> | string | undefined;
        if (typeof message === 'string') return message;
        if (message && typeof message === 'object') {
          const text = (message as { text?: string; data?: { text?: string } }).text
            || (message as { data?: { text?: string } }).data?.text;
          if (text) return text;
        }
        const msg2 = inner[0].messages as Array<{ message?: string }> | undefined;
        if (msg2?.[0]?.message) return msg2[0].message;
      }
    }
  } catch {
    /* continue */
  }

  if (typeof r.result === 'string') return r.result;
  if (typeof r.message === 'string') return r.message;
  if (typeof r.output === 'string') return r.output;

  // Last resort: stringify compact
  try {
    return JSON.stringify(raw).slice(0, 4000);
  } catch {
    return '';
  }
}
