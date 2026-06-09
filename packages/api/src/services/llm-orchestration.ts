import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import type { CCRBAllegation, OfficerProfile } from '@plate/database';

const client = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

/**
 * Result of legal analysis performed on officer allegations.
 * Contains pattern analysis, risk assessment, and recommendations.
 */
export interface LegalAnalysis {
  summary: string;
  pattern: string;
  riskFactors: string[];
  recommendations: string[];
}

/**
 * Context information for FOIL (Freedom of Information Law) requests.
 * Contains officer misconduct summary, examples, legal arguments, and evidence gaps.
 */
export interface FOILContext {
  officerMisconduct: string;
  misconduct_examples: string[];
  legal_arguments: string[];
  evidence_gaps: string[];
}

export class LLMOrchestration {
  /**
   * Analyzes CCRB allegations against an officer using Claude
   * Evaluates patterns, risk factors, and provides legal recommendations
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

    // Format allegations for analysis
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

    const prompt = `You are a legal expert analyzing police misconduct allegations from the CCRB (Civilian Complaint Review Board). Analyze the following allegations against officer ${officer.first_name || ''} ${officer.last_name || ''} (Badge: ${officer.badge_number || 'Unknown'}).

OFFICER PROFILE:
- Tax ID: ${officer.tax_id}
- Active Allegations: ${officer.active_allegations_count}
- Total Allegations: ${officer.total_allegations_count}
- Substantiated Allegations: ${officer.substantiated_allegations_count}
- Rank: ${officer.rank || 'Unknown'}
- Precinct: ${officer.precinct_number || 'Unknown'}

ALLEGATIONS:
${allegationsSummary}

Please provide a JSON response with the following structure:
{
  "summary": "A brief 2-3 sentence summary of the allegations and patterns",
  "pattern": "Description of any patterns identified (e.g., repeated conduct type, specific precinct issues, escalation over time)",
  "riskFactors": ["Array of specific risk factors identified"],
  "recommendations": ["Array of legal recommendations or next steps"]
}

Focus on patterns, severity, and legal implications.`;

    try {
      const message = await client.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text content from response
      const textContent = message.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      // Parse JSON from response (may be wrapped in markdown code blocks)
      let jsonStr = textContent.text;
      const jsonMatch = jsonStr.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        // Try to extract JSON object directly
        const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          jsonStr = objectMatch[0];
        }
      }

      const analysis = JSON.parse(jsonStr) as LegalAnalysis;

      // Validate response structure
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
   * Generates FOIL (Freedom of Information Law) context for substantiated allegations
   * Creates legal arguments and identifies evidence gaps
   */
  static async generateFOILContext(
    officer: OfficerProfile,
    allegations: CCRBAllegation[]
  ): Promise<FOILContext> {
    // Filter to substantiated allegations only
    const substantiatedAllegations = allegations.filter(
      (a) =>
        a.board_disposition === 'Substantiated' ||
        a.board_disposition === 'Substantiated (with Modification)'
    );

    if (!substantiatedAllegations || substantiatedAllegations.length === 0) {
      return {
        officerMisconduct: 'No substantiated allegations found',
        misconduct_examples: [],
        legal_arguments: [],
        evidence_gaps: [],
      };
    }

    // Format substantiated allegations for FOIL context
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

    const prompt = `You are a legal expert specializing in FOIL (Freedom of Information Law) requests under NY Public Officers Law Article 6. Generate context for FOIL requests based on substantiated CCRB allegations against officer ${officer.first_name || ''} ${officer.last_name || ''}.

OFFICER INFORMATION:
- Badge Number: ${officer.badge_number || 'Unknown'}
- Rank: ${officer.rank || 'Unknown'}
- Precinct: ${officer.precinct_number || 'Unknown'}
- Substantiated Allegations Count: ${officer.substantiated_allegations_count}

SUBSTANTIATED ALLEGATIONS:
${allegationDetails}

Please provide a JSON response with this structure:
{
  "officerMisconduct": "A 1-2 sentence overview of the officer's substantiated misconduct pattern",
  "misconduct_examples": ["List of specific examples from substantiated allegations that would justify FOIL requests"],
  "legal_arguments": ["List of legal arguments for why these records should be publicly available under FOIL. MUST cite NY Public Officers Law § 84, § 87, or § 89 in each argument"],
  "evidence_gaps": ["List of specific types of records/evidence that would be needed for a strong FOIL request"]
}

Focus on factual, substantiated information, legal citations to NY Public Officers Law, and justifications for document requests.`;

    try {
      const message = await client.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text content from response
      const textContent = message.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in response');
      }

      // Parse JSON from response (may be wrapped in markdown code blocks)
      let jsonStr = textContent.text;
      const jsonMatch = jsonStr.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        // Try to extract JSON object directly
        const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          jsonStr = objectMatch[0];
        }
      }

      const foilContext = JSON.parse(jsonStr) as FOILContext;

      // Validate response structure
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
}
