import type { SkillPack } from '../types';
import { AI_OUTPUT_DISCLAIMER, CONSENT_VERSION } from '../guardrails';

/** High-disclaimer constitutional literacy — law-student real-matter check. */
export const constitutionalEduPack: SkillPack = {
  id: 'constitutional-edu',
  version: '1.0.0',
  title: 'Constitutional Education — Fourth Amendment Basics',
  description:
    'High-level educational overview of Fourth Amendment concepts. Refuses case-specific application.',
  source: 'eagle + claude-for-legal law-student real-matter check',
  jurisdictions: ['US'],
  domains: ['constitutional', 'fourth-amendment', 'education'],
  activation: {
    triggers: [
      'What is the Fourth Amendment?',
      'search and seizure basics',
      'probable cause',
      'warrant requirement',
    ],
    matchPatterns: [
      'fourth amendment',
      '4th amendment',
      'search and seizure',
      'probable cause',
      'reasonable suspicion',
      'exclusionary rule',
      '\\bwarrant\\b',
    ],
    modules: ['engine', 'research'],
    priority: 78,
  },
  compliance: {
    mode: 'educational_only',
    requiresConsent: true,
    minConsentVersion: CONSENT_VERSION,
    requiredFooter: AI_OUTPUT_DISCLAIMER,
    doesNot: [
      'Apply doctrine to the user real facts as legal advice',
      'Predict suppression or dismissal outcomes',
      'Coach evasion of lawful process',
      'Claim live complete case-law currency',
    ],
    bannedPhrases: [
      'your search was illegal',
      'you will suppress',
      'guaranteed dismissal',
      'you should refuse',
    ],
  },
  behavior: {
    systemPrompt: `Teach general Fourth Amendment literacy only.
Hard gate: if user describes a real stop/search/arrest and asks if it was illegal or what to do — refuse application, offer concepts + attorney referral.
Never predict suppression chances. Label doctrine [model knowledge — verify].`,
    instructions: `1. Banner: educational only
2. Plain-language concept map (warrant, PC, RS as classroom labels)
3. Common misconceptions
4. What this does not answer (their stop, their case)
5. Full footer disclaimer`,
    staticReply: `> **Not legal advice.** General educational overview only.

## Fourth Amendment literacy (selected topics) [model knowledge — verify]

The Fourth Amendment addresses searches and seizures and related warrant concepts in U.S. constitutional law. Classroom labels you may encounter:

| Concept | Educational plain language |
|---------|----------------------------|
| Warrant | Often discussed as judicial authorization concepts — details and exceptions are complex |
| Probable cause | A higher suspicion threshold discussed in doctrine materials than "reasonable suspicion" |
| Reasonable suspicion | A lower threshold label used in some stop/frisk teaching materials |
| Exclusionary / suppression | Classroom labels for evidence consequences — highly fact- and court-specific |

**Common misconception:** Memorizing labels does **not** tell you what happened in a real stop. Application is jurisdiction- and fact-specific.

## What this does **not** do
- Decide if a real search/seizure was lawful
- Predict suppression or case results
- Replace a defense attorney

If this relates to a real incident, contact a licensed criminal defense attorney or public defender promptly.

${AI_OUTPUT_DISCLAIMER}`,
  },
  ui: {
    starterPrompts: [
      'Explain the Fourth Amendment in plain language (education only)',
    ],
    moduleLinks: ['/research', '/engine'],
  },
  sources: ['U.S. Const. amend. IV (public domain text)'],
};
