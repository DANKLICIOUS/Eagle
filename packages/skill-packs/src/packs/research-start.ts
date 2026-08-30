import type { SkillPack } from '../types';
import { AI_OUTPUT_DISCLAIMER, CONSENT_VERSION } from '../guardrails';

/** Adapted from legal-clinic/skills/research-start — leads not authorities. */
export const researchStartPack: SkillPack = {
  id: 'research-start',
  version: '1.0.0',
  title: 'Research Start — Leads Not Authorities',
  description:
    'Research roadmap: statutes to check, case-law areas (not cases), search terms. Nothing is verified authority.',
  source: 'claude-for-legal/legal-clinic/skills/research-start',
  jurisdictions: ['US-NY', 'US'],
  domains: ['research', 'statutes', 'education'],
  activation: {
    triggers: [
      'research roadmap',
      'where do I start researching',
      'statute to check',
      'case law areas',
    ],
    matchPatterns: [
      'research',
      'statute',
      'case law',
      'roadmap',
      'where (do|should) i (start|look)',
      'primary sources?',
    ],
    modules: ['engine', 'research'],
    priority: 80,
  },
  compliance: {
    mode: 'educational_only',
    requiresConsent: true,
    minConsentVersion: CONSENT_VERSION,
    requiredFooter: AI_OUTPUT_DISCLAIMER,
    doesNot: [
      'Provide authoritative citations you can rely on without verification',
      'Replace legal research platforms',
      'Guarantee roadmap completeness',
      'Manufacture case names when coverage is thin',
    ],
    bannedPhrases: ['controlling authority is', 'you can cite this as'],
  },
  behavior: {
    systemPrompt: `You produce RESEARCH ROADMAPS — leads, not authorities (claude-for-legal research-start).
List statutes *likely* relevant with [VERIFY], case law *areas* not specific case holdings, search terms.
Never invent case citations. If thin, say so and stop rather than fabricating.
Header every response with LEADS, NOT AUTHORITIES.`,
    instructions: `## Output structure
1. Banner: RESEARCH ROADMAP — LEADS, NOT AUTHORITIES
2. Frame the issue specifically
3. Statutory starting points (UNVERIFIED)
4. Case law areas to investigate (areas, not cases)
5. Search terms (CourtListener / public sources preferred for Eagle)
6. Uncertainty flags
7. What this roadmap does NOT do

Tag every suggested cite: [model knowledge — verify] unless tool-backed.`,
    staticReply: `═══════════════════════════════════════════════════════════════
  RESEARCH ROADMAP — LEADS, NOT AUTHORITIES
  Nothing below is a verified citation. Every statute area and
  search term is a starting point for YOUR research.
═══════════════════════════════════════════════════════════════

# Research Roadmap (educational)

**Default jurisdiction focus:** New York public records / FOIL / CCRB open data  
**Provenance:** [model knowledge — verify] unless you confirm against official sources

## Statutory starting points (UNVERIFIED)
- N.Y. Public Officers Law Article 6 (FOIL) — look for §§ 84, 87, 89 [public statute — verify]
- Agency-specific FOIL regulations / RAO procedures for the agency you care about [VERIFY]

## Case law areas to investigate (not cases)
- State doctrine on FOIL exemptions and agency burdens generally
- Local practice materials on NYPD/CCRB public records (clinic guides if any)
- Do **not** treat model-recalled case names as authorities — find them yourself

## Search terms
- CourtListener / public: \`FOIL "Public Officers Law" (exemption OR "body worn")\`
- Open data: NYC CCRB dataset keywords by precinct / FADO type
- Agency site: "records access officer" + agency name

## Uncertainty flags
- [UNCERTAIN: which agency holds the specific record type for your facts]
- [UNCERTAIN: whether a given exemption is commonly asserted — verify agency practice]

## What this roadmap does NOT do
- Give citations you can use without verification
- Do the research for you
- Replace Westlaw / CourtListener / official statute compilations

**Next:** verify statutes on official sites → run searches → discuss findings with a licensed attorney.

${AI_OUTPUT_DISCLAIMER}`,
  },
  ui: {
    starterPrompts: [
      'Build a research roadmap for FOIL exemptions (leads only)',
      'Where should I start researching public records law in NY?',
    ],
    moduleLinks: ['/research', '/engine'],
  },
  sources: ['claude-for-legal/legal-clinic/skills/research-start'],
};
