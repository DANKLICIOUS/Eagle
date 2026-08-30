/**
 * Shared educational guardrails for Eagle.
 * Adapted from claude-for-legal legal-clinic / litigation CLAUDE.md output rules
 * and App Store educational framing.
 */

export const CONSENT_VERSION = '2026-08-08';

export const LEGAL_DISCLAIMER =
  'Eagle provides educational legal information only. It is not a substitute for a licensed attorney and does not create an attorney–client relationship.';

export const AI_OUTPUT_DISCLAIMER =
  'AI-generated content is for educational purposes only. Verify important details and consult a licensed attorney before relying on any output.';

export const DRAFT_BANNER =
  'EDUCATIONAL DRAFT — AI-GENERATED — NOT LEGAL ADVICE — REVIEW WITH A LICENSED ATTORNEY BEFORE USE. Eagle does not file or submit documents.';

/** System preamble injected on every LLM call */
export const GLOBAL_SYSTEM_PREAMBLE = `You are Eagle's educational research assistant for public records literacy (FOIL process learning, open-data interpretation, and draft organization).

Hard rules (from claude-for-legal clinic/litigation guardrails, adapted for non-lawyer users):
1. You are NOT a lawyer, NOT a legal expert, and do NOT provide legal advice. Do not create an attorney–client relationship.
2. Frame all output as educational information and optional draft language for the user's own review with a licensed attorney.
3. Never guarantee outcomes, deadlines, disclosures, or court/agency results. Prefer "often," "generally," "under statute X as commonly described," and "verify current text and agency practice."
4. Do not tell the user what they "must," "should," or "need to" do in a case. Prefer "common educational next steps people study" or "topics to discuss with counsel."
5. Do not invent case citations, reporter pin cites, or non-public personnel facts. If a statute section is uncertain, say so and suggest verifying official sources.
6. Treat CCRB/open-data dispositions as agency administrative labels, not criminal guilt or civil liability findings.
7. Use provenance tags: [model knowledge — verify], [user provided], [open data], [public statute — verify].
8. No silent supplement: if facts are thin, state gaps. Do not invent badge numbers, dates, or incidents.
9. Never claim you will file, send, or track FOIL requests or court papers.
10. Every free-text draft artifact MUST open with:
    "${DRAFT_BANNER}"

Source: patterns from anthropics/claude-for-legal (legal-clinic research-start, draft, litigation chronology) — educational product adaptation only.`;

export const BANNED_PHRASES = [
  'win your case',
  'guaranteed',
  'you will win',
  'beat the courts',
  'legal expert',
  'i am your lawyer',
  'attorney-client privilege applies',
  'submit immediately',
  'file now',
  'you should sue',
  'proof of guilt',
  'definitely liable',
];

export const PHRASE_SWAPS: Array<{ risky: string; compliant: string }> = [
  { risky: 'Win your case', compliant: 'Understand your case' },
  { risky: 'Guaranteed defense', compliant: 'Educational defense concepts' },
  { risky: 'Beat the courts', compliant: 'Navigate the court system' },
  { risky: 'Legal loopholes', compliant: 'Common legal concepts to research' },
  { risky: 'File Now!', compliant: 'Generate educational draft' },
  { risky: 'Defense guidance', compliant: 'Learn how defenses are discussed in educational materials' },
];

export function containsBannedPhrase(text: string): string | null {
  const lower = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) return phrase;
  }
  return null;
}

export function ensureDisclaimerFooter(content: string, footer: string): string {
  if (content.includes('not legal advice') || content.includes('Not legal advice')) {
    return content;
  }
  return `${content.trim()}\n\n---\n${footer}`;
}

export function applyPhraseSwaps(text: string): string {
  let out = text;
  for (const { risky, compliant } of PHRASE_SWAPS) {
    const re = new RegExp(risky.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    out = out.replace(re, compliant);
  }
  return out;
}
