import type { AgentChatResponse, MatchedSkill, SkillModule, SkillPack } from './types';
import {
  AI_OUTPUT_DISCLAIMER,
  CONSENT_VERSION,
  GLOBAL_SYSTEM_PREAMBLE,
  applyPhraseSwaps,
  ensureDisclaimerFooter,
} from './guardrails';
import { foilNyPack } from './packs/foil-ny';
import { foilInterviewPack } from './packs/foil-interview';
import { ccrbOpenDataPack } from './packs/ccrb-open-data';
import { researchStartPack } from './packs/research-start';
import { chronologyPack } from './packs/chronology';
import { educationalQaPack } from './packs/educational-qa';
import { constitutionalEduPack } from './packs/constitutional-edu';

/** All registered educational skill packs (claude-for-legal adapted). */
export const SKILL_PACKS: SkillPack[] = [
  foilInterviewPack,
  foilNyPack,
  ccrbOpenDataPack,
  researchStartPack,
  chronologyPack,
  constitutionalEduPack,
  educationalQaPack, // lowest priority default
];

export function listSkills(): Array<Pick<SkillPack, 'id' | 'title' | 'description' | 'source' | 'version'>> {
  return SKILL_PACKS.map(({ id, title, description, source, version }) => ({
    id,
    title,
    description,
    source,
    version,
  }));
}

export function getSkill(id: string): SkillPack | undefined {
  return SKILL_PACKS.find((p) => p.id === id);
}

/**
 * Score packs by regex + triggers + surface bias.
 * Higher priority wins; first pattern hit adds score.
 */
export function matchSkills(
  userText: string,
  surface?: SkillModule,
  limit = 3
): MatchedSkill[] {
  const text = userText.trim();
  const scored: MatchedSkill[] = [];

  for (const pack of SKILL_PACKS) {
    let score = 0;

    if (surface && pack.activation.modules.includes(surface)) {
      score += 15;
    }

    for (const pattern of pack.activation.matchPatterns) {
      try {
        if (new RegExp(pattern, 'i').test(text)) {
          score += 40 + pack.activation.priority / 10;
          break;
        }
      } catch {
        // ignore bad patterns
      }
    }

    for (const trigger of pack.activation.triggers) {
      if (text.toLowerCase().includes(trigger.toLowerCase())) {
        score += 20;
      }
    }

    // Default educational pack always eligible as weak match
    if (pack.id === 'educational-qa' && score === 0) {
      score = 5;
    }

    if (score > 0) {
      scored.push({ pack, score });
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function pickPrimarySkill(userText: string, surface?: SkillModule): SkillPack {
  const matches = matchSkills(userText, surface, 1);
  return matches[0]?.pack ?? educationalQaPack;
}

/** Offline static reply path (no Anthropic key). */
export function generateStaticSkillReply(
  userText: string,
  surface?: SkillModule
): AgentChatResponse {
  const pack = pickPrimarySkill(userText, surface);
  const raw =
    pack.behavior.staticReply ??
    educationalQaPack.behavior.staticReply ??
    'I can help with educational FOIL, CCRB open data, timelines, and research roadmaps.';

  const content = ensureDisclaimerFooter(applyPhraseSwaps(raw), pack.compliance.requiredFooter);

  return {
    content,
    skillId: pack.id,
    skillTitle: pack.title,
    sources: pack.sources ?? [],
    disclaimer: pack.compliance.requiredFooter,
    mode: 'static',
    provenance: [
      `skill:${pack.id}@${pack.version}`,
      `source:${pack.source}`,
      `consent:${CONSENT_VERSION}`,
    ],
  };
}

export function buildSkillSystemPrompt(pack: SkillPack): string {
  return [
    GLOBAL_SYSTEM_PREAMBLE,
    '',
    `## Active skill: ${pack.title} (${pack.id})`,
    `Upstream pattern: ${pack.source}`,
    pack.behavior.systemPrompt,
    '',
    '## Instructions',
    pack.behavior.instructions,
    '',
    '## What this skill does NOT do',
    ...pack.compliance.doesNot.map((d) => `- ${d}`),
    '',
    `Always end with: ${pack.compliance.requiredFooter || AI_OUTPUT_DISCLAIMER}`,
  ].join('\n');
}
