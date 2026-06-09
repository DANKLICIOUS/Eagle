import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAllegationsByOfficerTaxId,
  getAllegationByComplaintId,
  upsertAllegation,
  getAllegationStats,
} from "../src/queries/allegations";
import {
  initializeSupabase,
  resetSupabaseClient,
} from "../src/client";
import type { CCRBAllegation } from "../src/types";

// Mock allegation data
const mockAllegation: CCRBAllegation = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  complaint_id: "CCRB-2024-001",
  tax_id: "123456789",
  unique_id: "UNIQUE-001",
  fado_type: "Force",
  allegation: "Excessive force",
  allegation_category: "Physical Abuse",
  incident_date: "2024-01-15",
  incident_precinct: 1,
  officer_command_at_incident: "Patrol",
  officer_rank_incident: "Officer",
  officer_name: "John Doe",
  precinct_at_incident: "1",
  board_disposition: "Substantiated",
  status: "closed",
  created_at: "2024-01-16T00:00:00Z",
  updated_at: "2024-01-16T00:00:00Z",
};

const mockAllegation2: CCRBAllegation = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  complaint_id: "CCRB-2024-002",
  tax_id: "123456789",
  unique_id: "UNIQUE-002",
  fado_type: "Conduct",
  allegation: "Abuse of authority",
  allegation_category: "Conduct",
  incident_date: "2024-01-10",
  incident_precinct: 1,
  officer_command_at_incident: "Patrol",
  officer_rank_incident: "Officer",
  officer_name: "John Doe",
  precinct_at_incident: "1",
  board_disposition: "Unsubstantiated",
  status: "closed",
  created_at: "2024-01-11T00:00:00Z",
  updated_at: "2024-01-11T00:00:00Z",
};

const mockAllegation3: CCRBAllegation = {
  id: "550e8400-e29b-41d4-a716-446655440002",
  complaint_id: "CCRB-2024-003",
  tax_id: "123456789",
  unique_id: "UNIQUE-003",
  fado_type: "Conduct",
  allegation: "Discourtesy",
  allegation_category: "Conduct",
  incident_date: "2024-01-05",
  incident_precinct: 1,
  officer_command_at_incident: "Patrol",
  officer_rank_incident: "Officer",
  officer_name: "John Doe",
  precinct_at_incident: "1",
  board_disposition: "Exonerated",
  status: "closed",
  created_at: "2024-01-06T00:00:00Z",
  updated_at: "2024-01-06T00:00:00Z",
};

describe("Allegation Queries", () => {
  beforeEach(() => {
    resetSupabaseClient();
  });

  describe("getAllegationsByOfficerTaxId", () => {
    it("should return allegations by tax_id ordered by incident_date descending", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockAllegation, mockAllegation2, mockAllegation3],
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      const result = await getAllegationsByOfficerTaxId("123456789");
      expect(result).toEqual([mockAllegation, mockAllegation2, mockAllegation3]);
      expect(mockFrom).toHaveBeenCalledWith("ccrb_allegations");
    });

    it("should return empty array if no allegations found", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      const result = await getAllegationsByOfficerTaxId("nonexistent");
      expect(result).toEqual([]);
    });

    it("should throw error on database error", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: {
                code: "SOME_ERROR",
                message: "Database error",
              },
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      await expect(getAllegationsByOfficerTaxId("123456789")).rejects.toThrow(
        "Failed to fetch allegations"
      );
    });
  });

  describe("getAllegationByComplaintId", () => {
    it("should return allegation by complaint_id", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockAllegation,
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      const result = await getAllegationByComplaintId("CCRB-2024-001");
      expect(result).toEqual(mockAllegation);
    });

    it("should return null if allegation not found (404)", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "PGRST116", message: "Not found" },
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      const result = await getAllegationByComplaintId("nonexistent");
      expect(result).toBeNull();
    });

    it("should throw error on database error", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: {
                code: "SOME_ERROR",
                message: "Database error",
              },
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      await expect(getAllegationByComplaintId("CCRB-2024-001")).rejects.toThrow(
        "Failed to fetch allegation"
      );
    });
  });

  describe("upsertAllegation", () => {
    it("should upsert allegation by complaint_id", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockAllegation,
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      const result = await upsertAllegation(mockAllegation);
      expect(result).toEqual(mockAllegation);
      expect(mockFrom).toHaveBeenCalledWith("ccrb_allegations");

      // Verify that upsert was called with onConflict set to "complaint_id"
      const upsertCall = mockFrom().upsert.mock.calls[0];
      expect(upsertCall[1]).toEqual({ onConflict: "complaint_id" });
    });

    it("should update updated_at timestamp", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockAllegation,
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      await upsertAllegation(mockAllegation);

      // Verify that updated_at was set
      const upsertData = mockFrom().upsert.mock.calls[0][0][0];
      expect(upsertData.updated_at).toBeDefined();
      expect(typeof upsertData.updated_at).toBe("string");
    });

    it("should throw error on database error", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: {
                code: "SOME_ERROR",
                message: "Database error",
              },
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      await expect(upsertAllegation(mockAllegation)).rejects.toThrow(
        "Failed to upsert allegation"
      );
    });
  });

  describe("getAllegationStats", () => {
    it("should compute correct stats from allegations", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockAllegation, mockAllegation2, mockAllegation3],
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      const stats = await getAllegationStats("123456789");

      expect(stats).toEqual({
        total: 3,
        substantiated: 1,
        unsubstantiated: 1,
        exonerated: 1,
      });
    });

    it("should handle case-insensitive board_disposition", async () => {
      const allegationLowercase: CCRBAllegation = {
        ...mockAllegation,
        board_disposition: "substantiated", // lowercase
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [allegationLowercase],
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      const stats = await getAllegationStats("123456789");

      expect(stats.substantiated).toBe(1);
    });

    it("should not count 'substantiated' when matching 'unsubstantiated'", async () => {
      const unsubstantiatedAllegation: CCRBAllegation = {
        ...mockAllegation,
        board_disposition: "Unsubstantiated",
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [unsubstantiatedAllegation],
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      const stats = await getAllegationStats("123456789");

      expect(stats.substantiated).toBe(0);
      expect(stats.unsubstantiated).toBe(1);
    });

    it("should return zero stats for officer with no allegations", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      const stats = await getAllegationStats("nonexistent");

      expect(stats).toEqual({
        total: 0,
        substantiated: 0,
        unsubstantiated: 0,
        exonerated: 0,
      });
    });

    it("should handle null board_disposition", async () => {
      const allegationNullDisposition: CCRBAllegation = {
        ...mockAllegation,
        board_disposition: null,
      };

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [allegationNullDisposition, mockAllegation],
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      const stats = await getAllegationStats("123456789");

      expect(stats.total).toBe(2);
      expect(stats.substantiated).toBe(1);
    });
  });
});
