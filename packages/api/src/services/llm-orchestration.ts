import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import type { CCRBAllegation, OfficerProfile } from '@plate/database';
import { DRAFT_BANNER, GLOBAL_SYSTEM_PREAMBLE } from '@plate/skill-packs';

const client = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

/**
 * Educational pattern summary of public allegation records.
 * Field names kept for API compatibility; semantics are educational (not legal advice).
 * riskFactors → research considerations; recommendations → educational next steps.
 */
export interface LegalAnalysis {
  summary: string;
  pattern: string;
  riskFactors: string[];
  recommendations: string[];
}

/**
 * Educational FOIL study context.
 * legal_arguments = FOIL study points citing POL as reading pointers (not advocacy).
 */
export interface FOILContext {
  officerMisconduct: string;
  misconduct_examples: string[];
  legal_arguments: string[];
  evidence_gaps: string[];
}

function parseJsonFromModel(text: string): unknown {
  let jsonStr = text;
  const jsonMatch = jsonStr.match(/```json\n?([\s\S]*?)\n?```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  } else {
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }
  }
  return JSON.parse(jsonStr);
}

export class LLMOrchestration {
  /**
   * Educational pattern summary of CCRB-style public allegation rows.
   * Adapted to educational framing (claude-for-legal: leads not authorities).
   */
  static async analyzeAllegations(
    allegations: CCRBAllegation[],
    officer: OfficerProfile
  ): Promise<LegalAnalysis> {
    if (!allegations || allegations.length === 0) {
      return {
        summary: 'No allegations to analyze',
        pattern: 'N/A',
        riskFactors: [],
        recommendations: [],
      };
    }

    const allegationsSummary = allegations
      .map(
        (a) => `
    - Allegation: ${a.allegation}
      Category: ${a.allegation_category}
      Date: ${a.incident_date}
      Disposition: ${a.board_disposition || 'Pending'}
      Status: ${a.status || 'Unknown'}
      FADO Type: ${a.fado_type}
      Precinct: ${a.incident_precinct || 'Unknown'}
      Officer Rank: ${a.officer_rank_incident || 'Unknown'}`
      )
      .join('\n');

    const prompt = `Produce an EDUCATIONAL pattern summary of public CCRB-style allegation records for learning and FOIL scoping only — not legal advice, liability conclusions, or litigation strategy.

OFFICER PROFILE (public-record style fields):
- Tax ID: ${officer.tax_id}
- Name: ${officer.first_name || ''} ${officer.last_name || ''}
- Badge: ${officer.badge_number || 'Unknown'}
- Rank: ${officer.rank || 'Unknown'}
- Precinct: ${officer.precinct_number || 'Unknown'}
- Active / total / substantiated counts: ${officer.active_allegations_count} / ${officer.total_allegations_count} / ${officer.substantiated_allegations_count}

ALLEGATIONS:
${allegationsSummary}

Return ONLY valid JSON:
{
  "summary": "2–3 neutral sentences on what the public records show. No guilt conclusions.",
  "pattern": "Educational description of recurring categories or disposition mix. Patterns are research signals only.",
  "riskFactors": ["Factual/educational research considerations to verify — not legal risk scores"],
  "recommendations": ["Process-learning steps only (e.g. review FOIL guidance, discuss with licensed attorney) — never case strategy"]
}

Forbidden: sue/file advice, guarantees, invented case law, equating dispositions with criminal guilt.`;

    try {
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: GLOBAL_SYSTEM_PREAMBLE,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = message.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      const analysis = parseJsonFromModel(textContent.text) as LegalAnalysis;

      if (!analysis.summary || !analysis.pattern) {
        throw new Error('Invalid response structure from Claude');
      }

      return {
        summary: analysis.summary,
        pattern: analysis.pattern,
        riskFactors: analysis.riskFactors || [],
        recommendations: analysis.recommendations || [],
      };
    } catch (error) {
      console.error('Error analyzing allegations:', error);
      throw error;
    }
  }

  /**
   * Educational FOIL study notes from substantiated public rows.
   */
  static async generateFOILContext(
    officer: OfficerProfile,
    allegations: CCRBAllegation[]
  ): Promise<FOILContext> {
    const substantiatedAllegations = allegations.filter(
      (a) =>
        a.board_disposition === 'Substantiated' ||
        a.board_disposition === 'Substantiated (with Modification)'
    );

    if (!substantiatedAllegations || substantiatedAllegations.length === 0) {
      return {
        officerMisconduct: 'No substantiated allegations found in provided public rows',
        misconduct_examples: [],
        legal_arguments: [],
        evidence_gaps: [],
      };
    }

    const allegationDetails = substantiatedAllegations
      .map(
        (a) => `
    - Incident Date: ${a.incident_date}
      Location: Precinct ${a.incident_precinct || 'Unknown'}
      Allegation: ${a.allegation}
      Category: ${a.allegation_category}
      Disposition: ${a.board_disposition}
      Status: ${a.status}
      Officer Rank at Incident: ${a.officer_rank_incident || 'Unknown'}`
      )
      .join('\n');

    const prompt = `Prepare EDUCATIONAL FOIL study notes from substantiated public CCRB-style records. Help the user learn how FOIL requests are structured — not legal arguments for a court.

OFFICER INFORMATION:
- Name: ${officer.first_name || ''} ${officer.last_name || ''}
- Badge: ${officer.badge_number || 'Unknown'}
- Rank: ${officer.rank || 'Unknown'}
- Precinct: ${officer.precinct_number || 'Unknown'}
- Substantiated count field: ${officer.substantiated_allegations_count}

SUBSTANTIATED ALLEGATIONS (as provided):
${allegationDetails}

Return ONLY valid JSON:
{
  "officerMisconduct": "1–2 sentence educational restatement of what substantiated public dispositions reflect; do not assert courtroom findings beyond agency labels",
  "misconduct_examples": ["Short factual bullets drawn only from provided substantiated rows"],
  "legal_arguments": ["Educational FOIL study points that reference NY Public Officers Law § 84, § 87, or § 89 as reading pointers [public statute — verify] — not advocacy"],
  "evidence_gaps": ["Record types a learner might research (BWC, memo books, CAD) as educational checklist items"]
}

Do not claim exemptions never apply. Do not assert mandatory disclosure of any specific document.`;

    try {
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: GLOBAL_SYSTEM_PREAMBLE,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = message.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      const foilContext = parseJsonFromModel(textContent.text) as FOILContext;

      if (!foilContext.officerMisconduct) {
        throw new Error('Invalid response structure from Claude');
      }

      return {
        officerMisconduct: foilContext.officerMisconduct,
        misconduct_examples: foilContext.misconduct_examples || [],
        legal_arguments: foilContext.legal_arguments || [],
        evidence_gaps: foilContext.evidence_gaps || [],
      };
    } catch (error) {
      console.error('Error generating FOIL context:', error);
      throw error;
    }
  }

  /**
   * Educational sample FOIL letter for attorney/user review — not a filing.
   * Pattern adapted from claude-for-legal legal-clinic draft skill.
   */
  static async generateFOILLetter(
    officer: OfficerProfile,
    context: FOILContext
  ): Promise<string> {
    const letterDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const prompt = `Draft an EDUCATIONAL SAMPLE FOIL request letter for the user to study and optionally revise with a licensed attorney. This is NOT a filing, NOT legal advice, and NOT guaranteed to be accepted or answered.

OFFICER INFORMATION:
- Name: ${officer.first_name || 'Officer'} ${officer.last_name || '(Name Unknown)'}
- Badge Number: ${officer.badge_number || 'Unknown'}
- Rank: ${officer.rank || 'Unknown'}
- Precinct: ${officer.precinct_number || 'Unknown'}

FOIL STUDY CONTEXT (may be incomplete):
- Summary: ${context.officerMisconduct}
- Examples: ${context.misconduct_examples.join('; ')}
- Study points: ${context.legal_arguments.join('; ')}
- Possible record gaps: ${context.evidence_gaps.join('; ')}

Letter requirements:
1. FIRST LINE (required): ${DRAFT_BANNER}
2. Date line using: ${letterDate}
3. Placeholder blocks for requester name, address, email, phone (do not invent a real identity).
4. Addressee: Records Access Officer for a relevant agency (e.g. NYPD) as an educational example.
5. Request body: clear categories of records; only use facts provided; use [FACT NEEDED] for gaps.
6. You MAY mention N.Y. Public Officers Law Article 6 and commonly discussed §§ 84, 87, 89 as educational references [public statute — verify]. Do NOT invent case citations.
7. Note that acknowledgment/response timelines are statutory frameworks subject to extensions and exemptions — do not promise 5- or 20-day results.
8. Closing: "Sincerely," + placeholders. Do not say the letter is court-ready or "submit immediately."
9. End with a short user review checklist (facts accurate, VERIFY flags, attorney review before send).
10. Return plain text only (no markdown fences).

Forbidden: guarantees; "no exemption applies"; courtroom filings; advice to sue; claiming Eagle is the user's attorney.`;

    try {
      const message = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: GLOBAL_SYSTEM_PREAMBLE,
        messages: [{ role: 'user', content: prompt }],
      });

      const textContent = message.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      let letter = textContent.text.trim();
      if (!letter.includes('EDUCATIONAL DRAFT')) {
        letter = `${DRAFT_BANNER}\n\n${letter}`;
      }
      return letter;
    } catch (error) {
      console.error('Error generating FOIL letter:', error);
      throw error;
    }
  }
}
