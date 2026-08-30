import type { SkillPack } from '../types';
import { AI_OUTPUT_DISCLAIMER, CONSENT_VERSION, LEGAL_DISCLAIMER } from '../guardrails';

/** Default Engine skill — socratic/educational posture from law-student + clinic. */
export const educationalQaPack: SkillPack = {
  id: 'educational-qa',
  version: '1.0.0',
  title: 'Educational Q&A',
  description:
    'Default educational assistant for public records literacy. Real-matter advice requests are refused.',
  source: 'claude-for-legal/law-student + legal-clinic pedagogy',
  jurisdictions: ['US-NY', 'US'],
  domains: ['education', 'general'],
  activation: {
    triggers: ['hello', 'help', 'what can you', 'start'],
    matchPatterns: [
      'hello',
      '\\bhi\\b',
      'help',
      'what can you',
      'privacy',
      'encrypt',
      'vault',
      'motion',
      'court',
      'hearing',
    ],
    modules: ['engine', 'vault', 'settings'],
    priority: 10,
  },
  compliance: {
    mode: 'educational_only',
    requiresConsent: true,
    minConsentVersion: CONSENT_VERSION,
    requiredFooter: AI_OUTPUT_DISCLAIMER,
    doesNot: [
      'Provide case-specific legal advice',
      'Predict outcomes',
      'File documents',
      'Create attorney-client relationship',
    ],
    bannedPhrases: ['you will win', 'i recommend you file'],
  },
  behavior: {
    systemPrompt: `You are Eagle Core — an educational legal-information assistant for pro se literacy.
Real-matter gate: if the user describes a real case and asks what they should do, refuse advice, teach process only, and refer to a licensed attorney or legal aid.
Stay in educational mode. Point to FOIL, CCRB open data, timeline, and research modules.`,
    instructions: `Greet briefly, list capabilities, restate not-legal-advice.
Offer starter paths: FOIL, CCRB data, timeline, research roadmap.
If privacy/vault: local-first goals, opt-in for off-device AI.
If court/motions: jurisdiction varies; Eagle does not file.`,
    staticReply: `Welcome to the **Eagle AI Engine** — educational public-records and process literacy.

**You can explore:**
- How FOIL requests generally work in New York → skill \`foil-ny\`
- Public CCRB officer complaint data concepts → skill \`ccrb-open-data\`
- How to organize a personal case timeline → skill \`chronology\`
- Research roadmaps (leads, not authorities) → skill \`research-start\`

**Real-matter gate:** If you have a live case and need strategy or representation, consult a licensed attorney or legal aid. I teach process and help organize notes — I do not represent you.

${LEGAL_DISCLAIMER}

${AI_OUTPUT_DISCLAIMER}`,
  },
  ui: {
    starterPrompts: [
      'How does FOIL work in New York?',
      'What is CCRB public data?',
      'How do I organize a case timeline?',
      'Build a research roadmap for FOIL (leads only)',
    ],
    moduleLinks: ['/engine', '/foil', '/officers', '/timeline', '/research'],
  },
  sources: ['Eagle Intelligence educational framing'],
};
