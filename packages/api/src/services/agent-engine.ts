import Anthropic from '@anthropic-ai/sdk';
import {
  type AgentChatRequest,
  type AgentChatResponse,
  type SkillModule,
  applyPhraseSwaps,
  buildSkillSystemPrompt,
  containsBannedPhrase,
  ensureDisclaimerFooter,
  generateStaticSkillReply,
  pickPrimarySkill,
  CONSENT_VERSION,
} from '@plate/skill-packs';
import { config } from '../config';
import { LangflowClient, skillFlowMap } from './langflow-client';

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

/**
 * Educational agent engine:
 * 1) skill pack routing (claude-for-legal adapted)
 * 2) optional Langflow visual flow execution
 * 3) direct Anthropic
 * 4) static skill fallback
 */
export class AgentEngine {
  static hasApiKey(): boolean {
    return Boolean(config.anthropic.apiKey);
  }

  static async chat(req: AgentChatRequest): Promise<AgentChatResponse> {
    const message = (req.message || '').trim();
    if (!message) {
      return {
        content: 'Please enter a question about FOIL, CCRB open data, timelines, or research.',
        skillId: 'educational-qa',
        skillTitle: 'Educational Q&A',
        sources: [],
        disclaimer: 'Educational only — not legal advice.',
        mode: 'fallback',
        provenance: [`consent:${CONSENT_VERSION}`],
      };
    }

    if (req.consentVersion && req.consentVersion !== CONSENT_VERSION) {
      return {
        content:
          'Your educational consent is out of date. Open Settings or reload the app to re-accept the current educational-use terms before using the AI Engine.',
        skillId: 'educational-qa',
        skillTitle: 'Consent required',
        sources: [],
        disclaimer: 'Consent required',
        mode: 'fallback',
        provenance: [`consent_required:${CONSENT_VERSION}`],
      };
    }

    const surface = req.surface as SkillModule | undefined;
    const pack = pickPrimarySkill(message, surface);
    const flowMap = skillFlowMap();
    const hasLangflowFlow = Boolean(flowMap[pack.id] || flowMap['educational-qa']);

    // Prefer Langflow visual pipeline when enabled + flow mapped
    if (
      LangflowClient.isConfigured() &&
      hasLangflowFlow &&
      (config.langflow.preferOverAnthropic || !this.hasApiKey())
    ) {
      const lf = await LangflowClient.runSkillFlow(pack.id, message);
      if (lf.ok && lf.text.trim()) {
        let text = applyPhraseSwaps(lf.text);
        const banned = containsBannedPhrase(text);
        if (banned) {
          text = `${text}\n\n> [compliance] Softened phrasing related to “${banned}”. Educational use only.`;
        }
        text = ensureDisclaimerFooter(text, pack.compliance.requiredFooter);
        return {
          content: text,
          skillId: pack.id,
          skillTitle: pack.title,
          sources: [...(pack.sources ?? []), `langflow:${lf.flowId}`],
          disclaimer: pack.compliance.requiredFooter,
          mode: 'langflow',
          provenance: [
            `skill:${pack.id}@${pack.version}`,
            `source:${pack.source}`,
            `langflow_flow:${lf.flowId}`,
            `langflow_ms:${lf.latencyMs}`,
            `consent:${CONSENT_VERSION}`,
          ],
        };
      }
      // fall through if Langflow fails
      console.warn('Langflow run failed, falling through:', lf.error);
    }

    // No API key → static skill packs
    if (!this.hasApiKey()) {
      // Try Langflow even if prefer flag off (when Anthropic missing)
      if (LangflowClient.isConfigured() && hasLangflowFlow) {
        const lf = await LangflowClient.runSkillFlow(pack.id, message);
        if (lf.ok && lf.text.trim()) {
          let text = ensureDisclaimerFooter(applyPhraseSwaps(lf.text), pack.compliance.requiredFooter);
          return {
            content: text,
            skillId: pack.id,
            skillTitle: pack.title,
            sources: [...(pack.sources ?? []), `langflow:${lf.flowId}`],
            disclaimer: pack.compliance.requiredFooter,
            mode: 'langflow',
            provenance: [
              `skill:${pack.id}@${pack.version}`,
              `langflow_flow:${lf.flowId}`,
              `consent:${CONSENT_VERSION}`,
            ],
          };
        }
      }
      const staticReply = generateStaticSkillReply(message, surface);
      return { ...staticReply, skillId: pack.id, skillTitle: pack.title };
    }

    try {
      const client = new Anthropic({ apiKey: config.anthropic.apiKey });
      const system = buildSkillSystemPrompt(pack);

      const history = (req.history || []).slice(-8).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const response = await client.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 2048,
        system,
        messages: [
          ...history,
          {
            role: 'user',
            content: message,
          },
        ],
      });

      const textBlock = response.content.find((c) => c.type === 'text');
      let text =
        textBlock && textBlock.type === 'text'
          ? textBlock.text
          : generateStaticSkillReply(message, surface).content;

      text = applyPhraseSwaps(text);
      const banned = containsBannedPhrase(text);
      if (banned) {
        text = `${text}\n\n> [compliance] Removed overconfident framing related to “${banned}”. Educational use only.`;
      }
      text = ensureDisclaimerFooter(text, pack.compliance.requiredFooter);

      return {
        content: text,
        skillId: pack.id,
        skillTitle: pack.title,
        sources: pack.sources ?? [],
        disclaimer: pack.compliance.requiredFooter,
        mode: 'llm',
        provenance: [
          `skill:${pack.id}@${pack.version}`,
          `source:${pack.source}`,
          `model:${DEFAULT_MODEL}`,
          `consent:${CONSENT_VERSION}`,
        ],
      };
    } catch (error) {
      console.error('AgentEngine LLM error, falling back to static skill:', error);
      return generateStaticSkillReply(message, surface);
    }
  }
}
