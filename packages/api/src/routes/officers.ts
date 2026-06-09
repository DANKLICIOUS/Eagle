import { Router, type Router as ExpressRouter, Request, Response, NextFunction } from 'express';
import {
  getOfficerByTaxId,
  getOfficersByLastName,
  getOfficersByPrecinct,
  getAllegationsByOfficerTaxId,
  getAllegationStats,
  type OfficerProfile,
  type CCRBAllegation,
} from '@plate/database';
import { LLMOrchestration, type LegalAnalysis } from '../services/llm-orchestration';
import { APIError } from '../middleware/errorHandler';

const router: ExpressRouter = Router();

/**
 * Response interface for officer detail endpoint.
 * Combines officer profile, allegations, stats, and optional analysis.
 */
interface OfficerDetailResponse {
  officer: OfficerProfile;
  allegations: CCRBAllegation[];
  stats: {
    total: number;
    substantiated: number;
    unsubstantiated: number;
    exonerated: number;
  };
  analysis?: LegalAnalysis;
}

/**
 * Response interface for officer list endpoint.
 */
interface OfficerListResponse {
  officers: OfficerProfile[];
  count: number;
}

/**
 * GET /api/officers/by-tax-id/:taxId
 * Retrieve a single officer and their allegations by tax ID.
 *
 * Query Parameters:
 * - includeAnalysis (optional): boolean - If true, calls LLM to analyze allegations
 *
 * Response: OfficerDetailResponse
 * Status: 200 (success), 404 (not found), 400 (invalid input), 500 (error)
 */
router.get(
  '/by-tax-id/:taxId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { taxId } = req.params;
      const { includeAnalysis } = req.query;

      // Validate tax ID format (9 digits)
      if (!taxId || !/^\d{9}$/.test(taxId)) {
        throw new APIError(400, 'Invalid tax ID format. Tax ID must be exactly 9 digits.');
      }

      // Fetch officer profile
      const officer = await getOfficerByTaxId(taxId);
      if (!officer) {
        throw new APIError(404, `Officer with tax ID ${taxId} not found.`);
      }

      // Fetch allegations and stats in parallel for better performance
      const [allegations, stats] = await Promise.all([
        getAllegationsByOfficerTaxId(taxId),
        getAllegationStats(taxId),
      ]);

      // Build response
      const response: OfficerDetailResponse = {
        officer,
        allegations,
        stats,
      };

      // Optionally analyze allegations with LLM
      if (includeAnalysis === 'true') {
        try {
          if (allegations.length > 0) {
            response.analysis = await LLMOrchestration.analyzeAllegations(allegations, officer);
          }
        } catch (error) {
          // Log LLM error but don't fail the endpoint
          console.error('LLM analysis failed:', error);
          // Still return the officer data without analysis
        }
      }

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/officers/by-name
 * Retrieve officers by last name (and optionally first name).
 *
 * Query Parameters:
 * - lastName (required): string - Officer's last name
 * - firstName (optional): string - Officer's first name (not used in query, for context)
 *
 * Response: OfficerListResponse
 * Status: 200 (success), 400 (invalid input), 500 (error)
 */
router.get(
  '/by-name',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lastName, firstName } = req.query;

      // Validate required parameters
      if (typeof lastName !== 'string') {
        throw new APIError(400, 'lastName query parameter is required and must be a string.');
      }

      if (lastName.trim().length === 0) {
        throw new APIError(400, 'lastName cannot be empty string.');
      }

      // Fetch officers by last name
      // Note: firstName is optional and not used in the database query,
      // but can be provided by the client for filtering context
      const officers = await getOfficersByLastName(lastName);

      // Sort by active allegations count (descending)
      officers.sort((a, b) => b.active_allegations_count - a.active_allegations_count);

      const response: OfficerListResponse = {
        officers,
        count: officers.length,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/officers/by-precinct/:precinct
 * Retrieve all officers assigned to a specific precinct.
 *
 * Params:
 * - precinct (required): number - Precinct number
 *
 * Response: OfficerListResponse
 * Status: 200 (success), 400 (invalid input), 500 (error)
 */
router.get(
  '/by-precinct/:precinct',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { precinct } = req.params;

      // Validate precinct format with strict regex (must be all digits)
      if (!/^\d+$/.test(precinct)) {
        throw new APIError(
          400,
          'Invalid precinct format. Precinct must be a positive integer.'
        );
      }

      const precinctNum = parseInt(precinct, 10);
      if (precinctNum <= 0) {
        throw new APIError(400, 'Precinct must be greater than 0');
      }

      // Fetch officers by precinct
      const officers = await getOfficersByPrecinct(precinctNum);

      // Sort by active allegations count (descending)
      officers.sort((a, b) => b.active_allegations_count - a.active_allegations_count);

      const response: OfficerListResponse = {
        officers,
        count: officers.length,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
