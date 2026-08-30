import dotenv from 'dotenv';

dotenv.config();

function parseSkillFlowMap(): Record<string, string> {
  const raw = process.env.LANGFLOW_SKILL_FLOW_MAP || '';
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    console.warn('LANGFLOW_SKILL_FLOW_MAP is not valid JSON — ignoring');
    return {};
  }
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },
  /** Visual agent flows via Langflow (https://github.com/langflow-ai/langflow) */
  langflow: {
    enabled: process.env.LANGFLOW_ENABLED === 'true' || process.env.LANGFLOW_ENABLED === '1',
    baseUrl: process.env.LANGFLOW_BASE_URL || 'http://localhost:7860',
    apiKey: process.env.LANGFLOW_API_KEY || '',
    timeoutMs: parseInt(process.env.LANGFLOW_TIMEOUT_MS || '45000', 10),
    /** Prefer Langflow before direct Anthropic when a skill has a mapped flow */
    preferOverAnthropic:
      process.env.LANGFLOW_PREFER === 'true' || process.env.LANGFLOW_PREFER === '1',
    skillFlowMap: parseSkillFlowMap(),
    uiUrl: process.env.LANGFLOW_UI_URL || process.env.LANGFLOW_BASE_URL || 'http://localhost:7860',
  },
  environment: process.env.NODE_ENV || 'development',
};

export function validateConfig(): void {
  const requiredKeys = ['ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missing = requiredKeys.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missing.join(', ')}. Some features may not work.`
    );
  }
  if (config.langflow.enabled) {
    console.log(`Langflow integration enabled → ${config.langflow.baseUrl}`);
  }
}
