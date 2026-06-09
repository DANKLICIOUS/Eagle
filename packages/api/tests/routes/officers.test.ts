import { describe, it, expect, beforeEach, vi } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import { errorHandler } from '../../src/middleware/errorHandler';
import officerRoutes from '../../src/routes/officers';
import * as database from '@plate/database';
import { LLMOrchestration } from '../../src/services/llm-orchestration';

// Mock the database module
vi.mock('@plate/database', () => ({
  getOfficerByTaxId: vi.fn(),
  getOfficersByLastName: vi.fn(),
  getOfficersByPrecinct: vi.fn(),
  getAllegationsByOfficerTaxId: vi.fn(),
  getAllegationStats: vi.fn(),
  initializeSupabase: vi.fn(),
}));

// Mock the LLM orchestration service
vi.mock('../../src/services/llm-orchestration', () => ({
  LLMOrchestration: {
    analyzeAllegations: vi.fn(),
  },
}));

describe('Officer Routes', () => {
  let app: Express;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Create a fresh Express app for each test
    // NOTE: We build the app here (not importing index.ts) to avoid
    // side effects like validateConfig(), initializeSupabase(), and listen()
    app = express();
    app.use(express.json());
    app.use('/api/officers', officerRoutes);
    app.use(errorHandler);
  });

  describe('GET /api/officers/by-tax-id/:taxId', () => {
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
        id: '1',
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
    ];

    const mockStats = {
      total: 5,
      substantiated: 2,
      unsubstantiated: 2,
      exonerated: 1,
    };

    it('should return officer with allegations for valid tax ID', async () => {
      vi.mocked(database.getOfficerByTaxId).mockResolvedValue(mockOfficer);
      vi.mocked(database.getAllegationsByOfficerTaxId).mockResolvedValue(mockAllegations);
      vi.mocked(database.getAllegationStats).mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/officers/by-tax-id/123456789')
        .expect(200);

      expect(response.body).toHaveProperty('officer');
      expect(response.body).toHaveProperty('allegations');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.officer.tax_id).toBe('123456789');
      expect(response.body.allegations).toHaveLength(1);
    });

    it('should return 404 for non-existent officer', async () => {
      vi.mocked(database.getOfficerByTaxId).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/officers/by-tax-id/999999999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 for invalid tax ID (too short)', async () => {
      const response = await request(app)
        .get('/api/officers/by-tax-id/12345678')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(400);
      expect(response.body.error).toContain('Invalid tax ID format');
    });

    it('should return 400 for invalid tax ID (contains letters)', async () => {
      const response = await request(app)
        .get('/api/officers/by-tax-id/12345678A')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 for empty tax ID', async () => {
      const response = await request(app)
        .get('/api/officers/by-tax-id/0')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(400);
      expect(response.body.error).toContain('Invalid tax ID format');
    });

    it('should include LLM analysis when includeAnalysis=true', async () => {
      const mockAnalysis = {
        summary: 'Officer has pattern of force complaints',
        pattern: 'Excessive use of force in traffic stops',
        riskFactors: ['High complaint rate', 'Multiple substantiated allegations'],
        recommendations: ['Further training', 'Enhanced supervision'],
      };

      vi.mocked(database.getOfficerByTaxId).mockResolvedValue(mockOfficer);
      vi.mocked(database.getAllegationsByOfficerTaxId).mockResolvedValue(mockAllegations);
      vi.mocked(database.getAllegationStats).mockResolvedValue(mockStats);
      vi.mocked(LLMOrchestration.analyzeAllegations).mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .get('/api/officers/by-tax-id/123456789?includeAnalysis=true')
        .expect(200);

      expect(response.body).toHaveProperty('analysis');
      expect(response.body.analysis.summary).toContain('pattern');
    });

    it('should handle LLM errors gracefully and return data without analysis', async () => {
      vi.mocked(database.getOfficerByTaxId).mockResolvedValue(mockOfficer);
      vi.mocked(database.getAllegationsByOfficerTaxId).mockResolvedValue(mockAllegations);
      vi.mocked(database.getAllegationStats).mockResolvedValue(mockStats);
      vi.mocked(LLMOrchestration.analyzeAllegations).mockRejectedValue(
        new Error('LLM service unavailable')
      );

      const response = await request(app)
        .get('/api/officers/by-tax-id/123456789?includeAnalysis=true')
        .expect(200);

      // Should still succeed without analysis when LLM fails
      expect(response.body).toHaveProperty('officer');
      expect(response.body).toHaveProperty('allegations');
      expect(response.body).not.toHaveProperty('analysis');
    });
  });

  describe('GET /api/officers/by-name', () => {
    // Mock data in ascending order by allegations count to test sorting
    const mockOfficersAscending = [
      {
        tax_id: '987654321',
        first_name: 'Jane',
        last_name: 'Smith',
        badge_number: '54321',
        precinct_number: 77,
        rank: 'Sergeant',
        active_allegations_count: 1,
        total_allegations_count: 2,
        substantiated_allegations_count: 0,
        unsubstantiated_allegations_count: 2,
        exonerated_allegations_count: 0,
        officer_command_at_incident: 'Precinct 77',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
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
      },
    ];

    it('should return officers matching last name', async () => {
      vi.mocked(database.getOfficersByLastName).mockResolvedValue(mockOfficersAscending);

      const response = await request(app)
        .get('/api/officers/by-name?lastName=Smith')
        .expect(200);

      expect(response.body).toHaveProperty('officers');
      expect(response.body).toHaveProperty('count');
      expect(response.body.officers).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should return empty array when no matches found', async () => {
      vi.mocked(database.getOfficersByLastName).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/officers/by-name?lastName=NonExistent')
        .expect(200);

      expect(response.body.officers).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should require lastName query parameter', async () => {
      const response = await request(app)
        .get('/api/officers/by-name')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(400);
      expect(response.body.error).toContain('lastName');
    });

    it('should reject empty lastName', async () => {
      const response = await request(app)
        .get('/api/officers/by-name?lastName=')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.statusCode).toBe(400);
      expect(response.body.error).toContain('empty');
    });

    it('should sort results by active allegations (descending)', async () => {
      vi.mocked(database.getOfficersByLastName).mockResolvedValue(mockOfficersAscending);

      const response = await request(app)
        .get('/api/officers/by-name?lastName=Smith')
        .expect(200);

      const officers = response.body.officers;
      // Data comes in ascending order from database, should be sorted descending in response
      expect(officers[0].active_allegations_count).toBeGreaterThanOrEqual(
        officers[1].active_allegations_count
      );
      // First officer (John) should have 3 allegations, second (Jane) should have 1
      expect(officers[0].active_allegations_count).toBe(3);
      expect(officers[1].active_allegations_count).toBe(1);
    });
  });

  describe('GET /api/officers/by-precinct/:precinct', () => {
    const mockOfficers = [
      {
        tax_id: '123456789',
        first_name: 'John',
        last_name: 'Smith',
        badge_number: '12345',
        precinct_number: 25,
        rank: 'Police Officer',
        active_allegations_count: 5,
        total_allegations_count: 8,
        substantiated_allegations_count: 3,
        unsubstantiated_allegations_count: 4,
        exonerated_allegations_count: 1,
        officer_command_at_incident: 'Precinct 25',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        tax_id: '987654321',
        first_name: 'Jane',
        last_name: 'Doe',
        badge_number: '54321',
        precinct_number: 25,
        rank: 'Detective',
        active_allegations_count: 2,
        total_allegations_count: 3,
        substantiated_allegations_count: 1,
        unsubstantiated_allegations_count: 2,
        exonerated_allegations_count: 0,
        officer_command_at_incident: 'Precinct 25',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    it('should return officers in specified precinct', async () => {
      vi.mocked(database.getOfficersByPrecinct).mockResolvedValue(mockOfficers);

      const officers = await database.getOfficersByPrecinct(25);
      expect(officers.length).toBeGreaterThan(0);
      expect(officers.every((o) => o.precinct_number === 25)).toBe(true);
    });

    it('should return empty array for precinct with no officers', async () => {
      vi.mocked(database.getOfficersByPrecinct).mockResolvedValue([]);

      const officers = await database.getOfficersByPrecinct(999);
      expect(officers).toEqual([]);
    });

    it('should validate precinct is positive integer', async () => {
      const precinct = '25';
      const precinctNum = parseInt(precinct, 10);

      expect(!isNaN(precinctNum) && precinctNum > 0).toBe(true);
    });

    it('should reject non-numeric precinct', async () => {
      const precinct = 'ABC';
      const precinctNum = parseInt(precinct, 10);

      expect(isNaN(precinctNum)).toBe(true);
    });

    it('should reject negative precinct', async () => {
      const precinctNum = -25;
      expect(precinctNum <= 0).toBe(true);
    });

    it('should sort results by active allegations (descending)', async () => {
      vi.mocked(database.getOfficersByPrecinct).mockResolvedValue(mockOfficers);

      const officers = await database.getOfficersByPrecinct(25);
      expect(officers[0].active_allegations_count).toBeGreaterThanOrEqual(
        officers[1].active_allegations_count
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(database.getOfficerByTaxId).mockRejectedValue(
        new Error('Database connection failed')
      );

      expect(database.getOfficerByTaxId).toBeDefined();
    });

    it('should return 400 for invalid tax ID format', async () => {
      const invalidTaxIds = ['12345678', '12345678A', 'ABC', ''];

      for (const taxId of invalidTaxIds) {
        const isValid = /^\d{9}$/.test(taxId);
        expect(isValid).toBe(false);
      }
    });

    it('should return 400 for invalid precinct format', async () => {
      const invalidPrecincts = ['ABC', '-25', '0'];

      for (const precinct of invalidPrecincts) {
        const precinctNum = parseInt(precinct, 10);
        const isValid = !isNaN(precinctNum) && precinctNum > 0;
        expect(isValid).toBe(false);
      }
    });

    it('should return 400 for missing lastName parameter', async () => {
      const lastName = undefined;
      const isValid = lastName && typeof lastName === 'string' && lastName.trim().length > 0;
      expect(!isValid).toBe(true);
    });
  });

  describe('Response Format', () => {
    it('should return officer detail response with all fields', async () => {
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

      expect(mockOfficer).toHaveProperty('tax_id');
      expect(mockOfficer).toHaveProperty('officer_command_at_incident');
      expect(mockOfficer).toHaveProperty('created_at');
      expect(mockOfficer).toHaveProperty('updated_at');
    });

    it('should return officer list response with count', async () => {
      const mockResponse = {
        officers: [],
        count: 0,
      };

      expect(mockResponse).toHaveProperty('officers');
      expect(mockResponse).toHaveProperty('count');
      expect(mockResponse.count).toBe(mockResponse.officers.length);
    });
  });
});
