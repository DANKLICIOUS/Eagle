import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  initializeSupabase,
  getSupabaseClient,
  resetSupabaseClient,
} from "../src/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DatabaseSchema,
  OfficerProfile,
  CCRBAllegation,
  FOILRequest,
} from "../src/types";

describe("Supabase Client", () => {
  beforeEach(() => {
    // Reset client state before each test
    resetSupabaseClient();
  });

  describe("initializeSupabase", () => {
    it("should initialize client with URL and key", () => {
      initializeSupabase("https://test.supabase.co", "test-key");
      const client = getSupabaseClient();
      expect(client).toBeDefined();
    });

    it("should throw error if already initialized", () => {
      initializeSupabase("https://test.supabase.co", "test-key");

      expect(() => {
        initializeSupabase("https://test.supabase.co", "another-key");
      }).toThrow("Supabase client is already initialized");
    });

    it("should accept a pre-built client for testing", () => {
      const mockClient = {
        from: vi.fn(),
      } as unknown as SupabaseClient<DatabaseSchema>;

      initializeSupabase(
        "https://test.supabase.co",
        "test-key",
        mockClient
      );

      const client = getSupabaseClient();
      expect(client).toBe(mockClient);
    });
  });

  describe("getSupabaseClient", () => {
    it("should throw error if not initialized", () => {
      expect(() => {
        getSupabaseClient();
      }).toThrow("Supabase client has not been initialized");
    });

    it("should return initialized client", () => {
      initializeSupabase("https://test.supabase.co", "test-key");
      const client = getSupabaseClient();
      expect(client).toBeDefined();
    });

    it("should return the same client instance on multiple calls", () => {
      initializeSupabase("https://test.supabase.co", "test-key");
      const client1 = getSupabaseClient();
      const client2 = getSupabaseClient();
      expect(client1).toBe(client2);
    });
  });

  describe("resetSupabaseClient", () => {
    it("should reset the client to null", () => {
      initializeSupabase("https://test.supabase.co", "test-key");
      resetSupabaseClient();

      expect(() => {
        getSupabaseClient();
      }).toThrow("Supabase client has not been initialized");
    });

    it("should allow reinitializing after reset", () => {
      initializeSupabase("https://test.supabase.co", "test-key");
      resetSupabaseClient();
      initializeSupabase("https://test.supabase.co", "new-key");

      const client = getSupabaseClient();
      expect(client).toBeDefined();
    });
  });

  describe("Type exports", () => {
    it("should export all required types", () => {
      // Smoke test to verify types are properly exported and compilable
      const officerType: OfficerProfile = {
        tax_id: "123456789",
        first_name: "John",
        last_name: "Doe",
        badge_number: "12345",
        precinct_number: 1,
        rank: "Officer",
        active_allegations_count: 0,
        total_allegations_count: 0,
        substantiated_allegations_count: 0,
        unsubstantiated_allegations_count: 0,
        exonerated_allegations_count: 0,
        officer_command_at_incident: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const allegationType: CCRBAllegation = {
        id: "123",
        complaint_id: "CCRB-001",
        tax_id: "123456789",
        unique_id: "UNQ-001",
        fado_type: "Force",
        allegation: "Excessive force",
        allegation_category: "Physical Abuse",
        incident_date: "2024-01-01",
        incident_precinct: 1,
        officer_command_at_incident: "Patrol",
        officer_rank_incident: "Officer",
        officer_name: "John Doe",
        precinct_at_incident: "1",
        board_disposition: "Substantiated",
        status: "closed",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const foilType: FOILRequest = {
        id: "123",
        requester_name: "Jane Smith",
        requester_email: "jane@example.com",
        requester_phone: null,
        requester_address: null,
        target_agency: "NYPD",
        jurisdiction: "NY",
        foil_case_number: null,
        request_type: "officer_records",
        related_officer_tax_id: "123456789",
        incident_date_range_start: null,
        incident_date_range_end: null,
        document_description: "Officer personnel records",
        request_submitted_date: "2024-01-01",
        request_deadline_date: "2024-01-31",
        statutory_response_days: 20,
        status: "draft",
        response_received_date: null,
        notes: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      expect(officerType.tax_id).toBe("123456789");
      expect(allegationType.complaint_id).toBe("CCRB-001");
      expect(foilType.requester_email).toBe("jane@example.com");
    });
  });
});
