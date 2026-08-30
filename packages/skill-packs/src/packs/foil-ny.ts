import type { SkillPack } from '../types';
import { AI_OUTPUT_DISCLAIMER, CONSENT_VERSION, DRAFT_BANNER } from '../guardrails';

/** Adapted from legal-clinic/skills/draft (FOIA/letter draft pattern) → NY FOIL. */
export const foilNyPack: SkillPack = {
  id: 'foil-ny',
  version: '1.0.0',
  title: 'FOIL New York — Educational Drafting',
  description:
    'Teach FOIL process under N.Y. Public Officers Law Article 6 and generate educational request drafts. Does not file.',
  source: 'claude-for-legal/legal-clinic/skills/draft',
  jurisdictions: ['US-NY'],
  domains: ['foil', 'public-records', 'nypd'],
  activation: {
    triggers: [
      'How does FOIL work?',
      'Request body-worn camera',
      'public records request',
      'memo book FOIL',
      'freedom of information',
    ],
    matchPatterns: [
      '\\bfoil\\b',
      'freedom of information',
      'public records?',
      'body[- ]?worn',
      'memo book',
      '\\bcad\\b',
      'records access',
    ],
    modules: ['engine', 'foil'],
    priority: 90,
  },
  compliance: {
    mode: 'educational_only',
    requiresConsent: true,
    minConsentVersion: CONSENT_VERSION,
    requiredFooter: AI_OUTPUT_DISCLAIMER,
    doesNot: [
      'Submit FOIL requests to any agency',
      'Promise production timelines or full disclosure',
      'Represent the user before any agency',
      'Invent missing incident facts or badge numbers',
    ],
    bannedPhrases: ['submit immediately', 'guaranteed production', 'file now'],
  },
  behavior: {
    systemPrompt: `You are Eagle's educational FOIL coach for New York (adapted from claude-for-legal clinic draft skill).
Help users understand public-records process and structure draft request language.
Use [FACT NEEDED], [VERIFY], and [UNCERTAIN] flags for gaps — never invent facts.
Pedagogy posture: assist with draft structure, but user + attorney own final content.`,
    instructions: `## Workflow (clinic draft pattern → FOIL)
1. Confirm educational NY FOIL framing (Public Officers Law Article 6).
2. Identify agency (NYPD, CCRB, DA, other) and record categories (memo book, CAD, BWC, etc.).
3. Collect only facts the user provides; mark gaps [FACT NEEDED].
4. Explain educational process notes for § 89 acknowledgment/response concepts — not promises.
5. Generate draft opening with: ${DRAFT_BANNER}
6. Close with student/user review checklist and "does NOT file" note.

## Output rules
- Prefer smallest factual description.
- Cite POL §§ 84, 87, 89 only as [public statute — verify].
- Never say Eagle will send or track the request.`,
    staticReply: `${DRAFT_BANNER}

## FOIL in New York (educational overview)

FOIL is New York's Freedom of Information Law (Public Officers Law Article 6). It generally gives the public a right to request agency records, subject to statutory exemptions.

**What people often learn to request (examples):**
- NYPD memo books, dispatch/CAD logs, body-worn camera footage (subject to exemptions)
- CCRB materials that are public
- Agency policies and statistical reports

**Educational process notes [public statute — verify]:**
- § 84: public access framework
- § 87: exemptions (narrowly construed in doctrine discussions — always verify)
- § 89: acknowledgment / response timing concepts (extensions possible)

**Next educational steps:**
1. Identify the agency that holds the records
2. Describe records with dates, badge numbers, locations when known — use [FACT NEEDED] if unknown
3. Open the FOIL Builder module to generate an educational draft
4. Review with a licensed attorney before sending anything

## What this skill does NOT do
- File or email requests
- Guarantee agency response times or production
- Provide case strategy as legal advice

${AI_OUTPUT_DISCLAIMER}`,
  },
  ui: {
    starterPrompts: [
      'How does FOIL work in New York?',
      'Draft an educational BWC FOIL for my notes',
    ],
    moduleLinks: ['/foil', '/research'],
  },
  sources: ['NY Public Officers Law Article 6 §§ 84–89 [public statute — verify]'],
};
