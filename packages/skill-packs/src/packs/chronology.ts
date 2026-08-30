import type { SkillPack } from '../types';
import { AI_OUTPUT_DISCLAIMER, CONSENT_VERSION, DRAFT_BANNER } from '../guardrails';

/** Adapted from litigation-legal/skills/chronology — educational personal timeline. */
export const chronologyPack: SkillPack = {
  id: 'chronology',
  version: '1.0.0',
  title: 'Chronology / Timeline Draft',
  description:
    'Build a personal fact chronology from user-provided events. Not a filing; does not invent events.',
  source: 'claude-for-legal/litigation-legal/skills/chronology',
  jurisdictions: ['US'],
  domains: ['timeline', 'organization'],
  activation: {
    triggers: [
      'draft a timeline',
      'chronology of events',
      'organize what happened',
      'what happened when',
    ],
    matchPatterns: ['timeline', 'chronology', 'events?', 'what happened when'],
    modules: ['engine', 'timeline'],
    priority: 75,
  },
  compliance: {
    mode: 'educational_only',
    requiresConsent: true,
    minConsentVersion: CONSENT_VERSION,
    requiredFooter: AI_OUTPUT_DISCLAIMER,
    doesNot: [
      'Invent events not provided by the user or retrieved sources',
      'Create court filings or statements of fact for filing',
      'Guarantee litigation readiness',
      'Resolve contradictions between sources (flag both)',
    ],
    bannedPhrases: ['court-ready', 'guarantees preparedness', 'statement of facts for filing'],
  },
  behavior: {
    systemPrompt: `You help users build personal chronologies (adapted from claude-for-legal litigation chronology).
Extract/organize only user-provided facts. Tag significance lightly for the user's own notes (not advocacy side default).
Mark gaps. Never invent dates. Privilege note: Eagle chat is not attorney-client privileged.`,
    instructions: `## Structure
For each entry: when, where, who, what (facts only), evidence, agency interactions, confidence (certain|approximate|unknown).

## Rules from chronology skill
- No silent supplement of missing periods — list Gaps
- Tag provenance: [user provided] or [model knowledge — verify]
- Significance tags optional for personal notes: 🔴 key / 🟡 relevant / ⚪ background — user's judgment wins
- Open with educational draft banner if producing a full timeline document`,
    staticReply: `${DRAFT_BANNER}

## Suggested chronology structure (educational)

A **draft timeline** helps you organize facts for your own preparation — it is not a court filing and does not guarantee preparedness.

| Field | Guidance |
|-------|----------|
| Date / time | Exact or approximate range; mark confidence |
| Location | Where it happened |
| People | Who was present |
| What | Facts only — no legal conclusions |
| Evidence | Video, medical notes, witnesses |
| Agency | Stops, tickets, court dates |

**Gaps to list (from litigation chronology skill):**
- Date ranges with no events
- Expected but missing documentation
- Unreadable or unavailable sources

**Provenance:** mark each entry \`[user provided]\` unless it comes from a document you uploaded later.

**Open Timeline Draft** module to build rows. Export and review with a licensed attorney when ready.

## What this skill does NOT do
- Invent events
- File anything
- Claim privilege for Eagle chat

${AI_OUTPUT_DISCLAIMER}`,
  },
  ui: {
    starterPrompts: ['Help me organize a case timeline for my notes'],
    moduleLinks: ['/timeline', '/vault'],
  },
  sources: ['claude-for-legal/litigation-legal/skills/chronology'],
};
