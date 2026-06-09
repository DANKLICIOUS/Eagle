import { Router, type Router as ExpressRouter, Request, Response, NextFunction } from 'express';
import {
  getOfficerByTaxId,
  getAllegationsByOfficerTaxId,
  type OfficerProfile,
  type CCRBAllegation,
} from '@plate/database';
import { LLMOrchestration, type FOILContext } from '../services/llm-orchestration';
import { APIError } from '../middleware/errorHandler';

const router: ExpressRouter = Router();

/**
 * Response interface for FOIL letter generation endpoint.
 * Contains the generated letter, officer profile, FOIL context, and metadata.
 */
interface FOILLetterResponse {
  letter: string;
  officer: OfficerProfile;
  context: FOILContext;
  metadata: {
    generated_at: string;
    template_used?: string;
    allegations_count: number;
    allegations_ids: string[];
  };
}

/**
 * FOIL template definition.
 */
interface FOILTemplate {
  id: string;
  name: string;
  description: string;
}

/**
 * GET /api/foil/generate-letter
 * Generate a formal FOIL letter for an officer based on their substantiated allegations.
 *
 * Query Parameters:
 * - taxId (required): 9-digit NYPD tax ID
 * - allegation_ids (optional): comma-separated list of allegation IDs to include
 *
 * Response: FOILLetterResponse
 * Status: 200 (success), 404 (officer not found), 400 (invalid input), 500 (error)
 */
router.get(
  '/generate-letter',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taxId, allegation_ids } = req.query;

      // Validate tax ID format (9 digits)
      if (!taxId || typeof taxId !== 'string' || !/^\d{9}$/.test(taxId)) {
        throw new APIError(400, 'Invalid tax ID format. Tax ID must be exactly 9 digits.');
      }

      // Fetch officer profile
      const officer = await getOfficerByTaxId(taxId);
      if (!officer) {
        throw new APIError(404, `Officer with tax ID ${taxId} not found.`);
      }

      // Fetch all allegations for the officer
      const allAllegations = await getAllegationsByOfficerTaxId(taxId);

      // Filter allegations by IDs if provided
      let filteredAllegations = allAllegations;
      const selectedAllegationIds: string[] = [];

      if (allegation_ids && typeof allegation_ids === 'string') {
        const requestedIds = allegation_ids.split(',').map((id) => id.trim());
        filteredAllegations = allAllegations.filter((a) => requestedIds.includes(a.id));
        selectedAllegationIds.push(...filteredAllegations.map((a) => a.id));
      } else {
        selectedAllegationIds.push(...allAllegations.map((a) => a.id));
      }

      // Generate FOIL context from filtered allegations
      const foilContext = await LLMOrchestration.generateFOILContext(
        officer,
        filteredAllegations
      );

      // Generate the FOIL letter
      const letter = await LLMOrchestration.generateFOILLetter(officer, foilContext);

      // Build response
      const response: FOILLetterResponse = {
        letter,
        officer,
        context: foilContext,
        metadata: {
          generated_at: new Date().toISOString(),
          allegations_count: selectedAllegationIds.length,
          allegations_ids: selectedAllegationIds,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/foil/templates
 * Retrieve pre-defined FOIL templates for common request types.
 *
 * Response: { templates: FOILTemplate[] }
 * Status: 200 (success)
 */
router.get('/templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates: FOILTemplate[] = [
      {
        id: 'ccrb-records',
        name: 'Request All CCRB Records',
        description: 'Request all Civilian Complaint Review Board records for a specific officer',
      },
      {
        id: 'discipline-review',
        name: 'Demand Discipline Review',
        description: 'Request records related to personnel discipline decisions and reviews',
      },
      {
        id: 'use-of-force',
        name: 'Request Use of Force Documentation',
        description: 'Request all use of force incidents and related documentation',
      },
      {
        id: 'internal-affairs',
        name: 'Request Internal Affairs Investigation Files',
        description: 'Request investigative files from Internal Affairs Bureau',
      },
      {
        id: 'training-records',
        name: 'Request Officer Training Records',
        description: 'Request training records, certifications, and continuing education',
      },
      {
        id: 'complaint-summary',
        name: 'Request Summary of All Complaints',
        description: 'Request a complete summary of all complaints and allegations filed',
      },
      {
        id: 'disciplinary-history',
        name: 'Request Disciplinary History',
        description: 'Request complete record of all disciplinary actions and outcomes',
      },
    ];

    res.json({ templates });
  } catch (error) {
    next(error);
  }
});

export default router;
