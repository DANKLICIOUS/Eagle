/**
 * Eagle Skill Pack v1 — runtime educational skills.
 * Adapted from claude-for-legal SKILL.md patterns (clinic / litigation)
 * for consumer pro se education — NOT attorney work product.
 */

export type SkillModule =
  | 'engine'
  | 'foil'
  | 'officers'
  | 'timeline'
  | 'research'
  | 'vault'
  | 'settings';

export type SkillPack = {
  id: string;
  version: string;
  title: string;
  description: string;
  /** Upstream claude-for-legal source path (attribution) */
  source: string;
  jurisdictions: string[];
  domains: string[];
  activation: {
    triggers: string[];
    matchPatterns: string[];
    modules: SkillModule[];
    priority: number;
  };
  compliance: {
    mode: 'educational_only';
    requiresConsent: boolean;
    minConsentVersion: string;
    requiredFooter: string;
    doesNot: string[];
    bannedPhrases: string[];
  };
  behavior: {
    systemPrompt: string;
    instructions: string;
    /** Offline / demo reply when no LLM key */
    staticReply?: string;
  };
  ui?: {
    starterPrompts?: string[];
    moduleLinks?: string[];
  };
  sources?: string[];
};

export type MatchedSkill = {
  pack: SkillPack;
  score: number;
};

export type AgentChatRequest = {
  message: string;
  surface?: SkillModule;
  consentVersion?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
};

export type AgentChatResponse = {
  content: string;
  skillId: string;
  skillTitle: string;
  sources: string[];
  disclaimer: string;
  mode: 'llm' | 'static' | 'fallback' | 'langflow';
  provenance: string[];
};
