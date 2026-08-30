import type { SkillPack } from '../types';
import { AI_OUTPUT_DISCLAIMER, CONSENT_VERSION } from '../guardrails';

/** Eagle-native + open-data literacy; disposition caveats align with clinic research hygiene. */
export const ccrbOpenDataPack: SkillPack = {
  id: 'ccrb-open-data',
  version: '1.0.0',
  title: 'CCRB Open Data — Educational Research',
  description:
    'Explain public CCRB open-data concepts. Board dispositions are agency outcomes, not criminal guilt.',
  source: 'eagle + claude-for-legal research hygiene (leads not authorities)',
  jurisdictions: ['US-NY', 'US-NYC'],
  domains: ['ccrb', 'open-data', 'accountability'],
  activation: {
    triggers: [
      'What is CCRB data?',
      'officer complaint history',
      'badge search',
      'misconduct open data',
    ],
    matchPatterns: [
      '\\bccrb\\b',
      'complaint',
      'misconduct',
      'badge',
      'officer',
      'allegation',
      'substantiat',
    ],
    modules: ['engine', 'officers'],
    priority: 85,
  },
  compliance: {
    mode: 'educational_only',
    requiresConsent: true,
    minConsentVersion: CONSENT_VERSION,
    requiredFooter: AI_OUTPUT_DISCLAIMER,
    doesNot: [
      'Access non-public personnel files',
      'Equate CCRB dispositions with criminal guilt',
      'Provide courtroom strategy as legal advice',
      'Guarantee admissibility of open data in court',
    ],
    bannedPhrases: ['proof of guilt', 'definitely liable', 'you will win'],
  },
  behavior: {
    systemPrompt: `You help users understand public CCRB open data for educational research and FOIL scoping.
Emphasize public data limits and disposition meaning. Never treat open data as proof of liability.
Use provenance tags. Prefer "public records show…" over conclusions about guilt.`,
    instructions: `## Mandatory framing
- Search is over public open data, not confidential personnel files.
- Labels like substantiated / exonerated / unsubstantiated are agency/board outcomes, not criminal verdicts.
- Patterns are educational signals for research and FOIL scoping — not proof of liability.

## Workflow
1. Clarify intent (learn data vs look up a public profile concept).
2. Never invent allegation counts.
3. Offer optional educational FOIL scoping ideas as learning only.
4. Restate disposition caveat + disclaimer.`,
    staticReply: `## CCRB public data (educational)

Civilian Complaint Review Board (CCRB) data is a **public accountability source** for certain civilian complaints against NYPD officers. [open data]

**How Eagle frames this:**
- Search is over **public open data**, not confidential personnel files
- Board disposition labels (e.g. substantiated, exonerated, unsubstantiated) are **agency outcomes**, not courtroom findings of criminal guilt
- Patterns are **educational signals** for research and FOIL scoping — not proof of liability

**Suggested next steps (educational):**
- Use **Officer Lookup** to explore public complaint histories by name, badge, or precinct
- Pair findings with the FOIL Builder when you want an educational draft for primary documents
- Tag any model-recalled specifics as [model knowledge — verify]

## What this skill does NOT do
- Decide civil or criminal liability
- Access non-public personnel records
- Replace counsel for case strategy

**Source:** NYC Open Data CCRB (dataset 6xgr-kwjq) [open data]

${AI_OUTPUT_DISCLAIMER}`,
  },
  ui: {
    starterPrompts: [
      'What is CCRB public data?',
      'How should I read board dispositions?',
    ],
    moduleLinks: ['/officers', '/foil'],
  },
  sources: ['NYC Open Data CCRB dataset 6xgr-kwjq [open data]'],
};
