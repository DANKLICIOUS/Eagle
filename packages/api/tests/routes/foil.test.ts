import { describe, it, expect, beforeEach, vi } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import { errorHandler } from '../../src/middleware/errorHandler';
import foilRoutes from '../../src/routes/foil';
import * as database from '@plate/database';
import { LLMOrchestration } from '../../src/services/llm-orchestration';

// Mock the database module
vi.mock('@plate/database', () => ({
  getOfficerByTaxId: vi.fn(),
  getAllegationsByOfficerTaxId: vi.fn(),
  initializeSupabase: vi.fn(),
}));

// Mock the LLM orchestration service
vi.mock('../../src/services/llm-orchestration', () => ({
  LLMOrchestration: {
    generateFOILContext: vi.fn(),
    generateFOILLetter: vi.fn(),
  },
}));

describe('FOIL Routes', () => {
  let app: Express;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/foil', foilRoutes);
    app.use(errorHandler);
  });

  describe('GET /api/foil/generate-letter', () => {
    const mockOfficer = {
      tax_id: '123456789',
      first_name: 'John',
      last_name: 'Smith',
      badge_number: '12345',
      precinct_number: 25,
      rank: 'Police Officer',
      active_allegations_count: 3,
      total_allegations_count: 5,
      substantiated_allegations_count: 2,
      unsubstantiated_allegations_count: 2,
      exonerated_allegations_count: 1,
      officer_command_at_incident: 'Precinct 25',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const mockAllegations = [
      {
        id: 'allegation-1',
        complaint_id: 'CCRB-2023-001',
        tax_id: '123456789',
        unique_id: 'U-001',
        fado_type: 'ABUSE OF AUTHORITY',
        allegation: 'Excessive Force',
        allegation_category: 'Force',
        incident_date: '2023-06-15',
        incident_precinct: 25,
        officer_command_at_incident: 'Precinct 25',
        officer_rank_incident: 'Police Officer',
        officer_name: 'John Smith',
        precinct_at_incident: '25',
        board_disposition: 'Substantiated',
        status: 'Closed',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'allegation-2',
        complaint_id: 'CCRB-2023-002',
        tax_id: '123456789',
        unique_id: 'U-002',
        fado_type: 'ABUSE OF AUTHORITY',
        allegation: 'Improper Search',
        allegation_category: 'Abuse of Authority',
        incident_date: '2023-05-10',
        incident_precinct: 25,
        officer_command_at_incident: 'Precinct 25',
        officer_rank_incident: 'Police Officer',
        officer_name: 'John Smith',
        precinct_at_incident: '25',
        board_disposition: 'Substantiated',
        status: 'Closed',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    const mockFOILContext = {
      officerMisconduct: 'Officer Smith has a pattern of substantiated excessive force complaints.',
      misconduct_examples: ['Incident 1: Excessive force on civilian', 'Incident 2: Improper search'],
      legal_arguments: [
        'Public Officers Law § 84 requires disclosure of substantiated misconduct records',
        'Public Officers Law § 87 permits FOIL requests for law enforcement records',
      ],
      evidence_gaps: ['Complete incident reports', 'Body camera footage'],
    };

    const mockLetter = `FOIL REQUEST LETTER

[Date]

Freedom of Information Law Officer
New York Police Department
Records Request Unit
[Address]

Re: FOIL Request for Officer John Smith (Badge #12345)

Dear Sir/Madam,

Pursuant to the New York Public Officers Law Article 6, particularly § 84 and § 87, I am requesting access to records related to the substantiated misconduct allegations against Police Officer John Smith.

This officer has multiple substantiated allegations of excessive force and improper conduct. As a matter of public record under NY Public Officers Law § 84, documentation of disciplinary proceedings and misconduct findings should be available.

Requested Documents:
1. All CCRB complaint files
2. Complete incident reports
3. Disciplinary records

This request is made in the public interest and to ensure governmental accountability.

Respectfully,

[Signature]`;

    it('should generate FOIL letter for valid tax ID', async () => {
      vi.mocked(database.getOfficerByTaxId).mockResolvedValue(mockOfficer);
      vi.mocked(database.getAllegationsByOfficerTaxId).mockResolvedValue(mockAllegations);
      vi.mocked(LLMOrchestration.generateFOILContext).mockResolvedValue(mockFOILContext);
      vi.mocked(LLMOrchestration.generateFOILLetter).mockResolvedValue(mockLetter);

      const response = await request(app)
        .get('/api/foil/generate-letter')
        .query({ taxId: '123456789' })
        .expect(200);

      expect(response.body).toHaveProperty('letter');
      expect(response.body).toHaveProperty('officer');
      expect(response.body).toHaveProperty('context');
      expect(response.body).toHaveProperty('metadata');

      expect(response.body.letter).toBe(mockLetter);
      expect(response.body.officer.tax_id).toBe('123456789');
      expect(response.body.context).toEqual(mockFOILContext);
      expect(response.body.metadata.allegations_count).toBe(2);
      expect(response.body.metadata.allegations_ids).toEqual(['allegation-1', 'allegation-2']);
      expect(response.body.metadata.generated_at).toBeDefined();
    });

    it('should filter allegations by allegation_ids parameter', async () => {
      vi.mocked(database.getOfficerByTaxId).mockResolvedValue(mockOfficer);
      vi.mocked(database.getAllegationsByOfficerTaxId).mockResolvedValue(mockAllegations);
      vi.mocked(LLMOrchestration.generateFOILContext).mockResolvedValue(mockFOILContext);
      vi.mocked(LLMOrchestration.generateFOILLetter).mockResolvedValue(mockLetter);

      const response = await request(app)
        .get('/api/foil/generate-letter')
        .query({ taxId: '123456789', allegation_ids: 'allegation-1' })
        .expect(200);

      expect(response.body.metadata.allegations_count).toBe(1);
      expect(response.body.metadata.allegations_ids).toEqual(['allegation-1']);

      // Verify that generateFOILContext was called with filtered allegations
      const callArgs = vi.mocked(LLMOrchestration.generateFOILContext).mock.calls[0];
      expect(callArgs[1]).toHaveLength(1);
      expect(callArgs[1][0].id).toBe('allegation-1');
    });

    it('should handle comma-separated allegation_ids with whitespace', async () => {
      vi.mocked(database.getOfficerByTaxId).mockResolvedValue(mockOfficer);
      vi.mocked(database.getAllegationsByOfficerTaxId).mockResolvedValue(mockAllegations);
      vi.mocked(LLMOrchestration.generateFOILContext).mockResolvedValue(mockFOILContext);
      vi.mocked(LLMOrchestration.generateFOILLetter).mockResolvedValue(mockLetter);

      const response = await request(app)
        .get('/api/foil/generate-letter')
        .query({ taxId: '123456789', allegation_ids: ' allegation-1 , allegation-2 ' })
        .expect(200);

      expect(response.body.metadata.allegations_count).toBe(2);
      expect(response.body.metadata.allegations_ids).toHaveLength(2);
    });

    it('should return 400 for invalid tax ID format', async () => {
      const response = await request(app)
        .get('/api/foil/generate-letter')
        .query({ taxId: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid tax ID format');
    });

    it('should return 400 for missing tax ID', async () => {
      const response = await request(app).get('/api/foil/generate-letter').expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid tax ID format');
    });

    it('should return 400 for tax ID with incorrect digit count', async () => {
      const response = await request(app)
        .get('/api/foil/generate-letter')
        .query({ taxId: '12345678' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid tax ID format');
    });

    it('should return 404 when officer not found', async () => {
      vi.mocked(database.getOfficerByTaxId).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/foil/generate-letter')
        .query({ taxId: '999999999' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Officer with tax ID 999999999 not found');
    });

    it('should return 500 when generateFOILContext fails', async () => {
      vi.mocked(database.getOfficerByTaxId).mockResolvedValue(mockOfficer);
      vi.mocked(database.getAllegationsByOfficerTaxId).mockResolvedValue(mockAllegations);
      vi.mocked(LLMOrchestration.generateFOILContext).mockRejectedValue(
        new Error('LLM service error')
      );

      const response = await request(app)
        .get('/api/foil/generate-letter')
        .query({ taxId: '123456789' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 500 when generateFOILLetter fails', async () => {
      vi.mocked(database.getOfficerByTaxId).mockResolvedValue(mockOfficer);
      vi.mocked(database.getAllegationsByOfficerTaxId).mockResolvedValue(mockAllegations);
      vi.mocked(LLMOrchestration.generateFOILContext).mockResolvedValue(mockFOILContext);
      vi.mocked(LLMOrchestration.generateFOILLetter).mockRejectedValue(
        new Error('Letter generation failed')
      );

      const response = await request(app)
        .get('/api/foil/generate-letter')
        .query({ taxId: '123456789' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/foil/templates', () => {
    it('should return array of FOIL templates', async () => {
      const response = await request(app).get('/api/foil/templates').expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(Array.isArray(response.body.templates)).toBe(true);
      expect(response.body.templates.length).toBeGreaterThan(0);

      // Verify template structure
      const template = response.body.templates[0];
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('description');
      expect(typeof template.id).toBe('string');
      expect(typeof template.name).toBe('string');
      expect(typeof template.description).toBe('string');
    });

    it('should return all expected templates', async () => {
      const response = await request(app).get('/api/foil/templates').expect(200);

      const templates = response.body.templates;
      const templateIds = templates.map((t: any) => t.id);

      expect(templateIds).toContain('ccrb-records');
      expect(templateIds).toContain('discipline-review');
      expect(templateIds).toContain('use-of-force');
      expect(templateIds).toContain('internal-affairs');
      expect(templateIds).toContain('training-records');
      expect(templateIds).toContain('complaint-summary');
      expect(templateIds).toContain('disciplinary-history');
    });
  });
});
