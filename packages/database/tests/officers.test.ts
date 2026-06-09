import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getOfficerByTaxId,
  getOfficersByLastName,
  getOfficersByPrecinct,
  upsertOfficer,
} from "../src/queries/officers";
import {
  initializeSupabase,
  resetSupabaseClient,
} from "../src/client";
import type { OfficerProfile } from "../src/types";

// Mock officer data
const mockOfficer: OfficerProfile = {
  tax_id: "123456789",
  first_name: "John",
  last_name: "Doe",
  badge_number: "12345",
  precinct_number: 1,
  rank: "Officer",
  active_allegations_count: 5,
  total_allegations_count: 10,
  substantiated_allegations_count: 3,
  unsubstantiated_allegations_count: 2,
  exonerated_allegations_count: 5,
  officer_command_at_incident: "Patrol",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockOfficer2: OfficerProfile = {
  tax_id: "987654321",
  first_name: "Jane",
  last_name: "Doe",
  badge_number: "54321",
  precinct_number: 1,
  rank: "Detective",
  active_allegations_count: 3,
  total_allegations_count: 5,
  substantiated_allegations_count: 2,
  unsubstantiated_allegations_count: 1,
  exonerated_allegations_count: 2,
  officer_command_at_incident: "Detective",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("Officer Queries", () => {
  beforeEach(() => {
    resetSupabaseClient();
  });

  describe("getOfficerByTaxId", () => {
    it("should return an officer by tax_id", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockOfficer,
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      const result = await getOfficerByTaxId("123456789");
      expect(result).toEqual(mockOfficer);
      expect(mockFrom).toHaveBeenCalledWith("officer_profiles");
    });

    it("should return null if officer not found (404)", async () => {
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

      const result = await getOfficerByTaxId("nonexistent");
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
                message: "Database connection failed",
              },
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      await expect(getOfficerByTaxId("123456789")).rejects.toThrow(
        "Failed to fetch officer"
      );
    });
  });

  describe("getOfficersByLastName", () => {
    it("should return officers by last_name ordered by active_allegations_count", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockOfficer, mockOfficer2],
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      const result = await getOfficersByLastName("Doe");
      expect(result).toEqual([mockOfficer, mockOfficer2]);
      expect(mockFrom).toHaveBeenCalledWith("officer_profiles");
    });

    it("should return empty array if no officers found", async () => {
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

      const result = await getOfficersByLastName("NonExistent");
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

      await expect(getOfficersByLastName("Doe")).rejects.toThrow(
        "Failed to fetch officers"
      );
    });
  });

  describe("getOfficersByPrecinct", () => {
    it("should return officers by precinct_number ordered by active_allegations_count", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockOfficer, mockOfficer2],
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      const result = await getOfficersByPrecinct(1);
      expect(result).toEqual([mockOfficer, mockOfficer2]);
      expect(mockFrom).toHaveBeenCalledWith("officer_profiles");
    });

    it("should return empty array if no officers found", async () => {
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

      const result = await getOfficersByPrecinct(99);
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

      await expect(getOfficersByPrecinct(1)).rejects.toThrow(
        "Failed to fetch officers"
      );
    });
  });

  describe("upsertOfficer", () => {
    it("should upsert an officer by tax_id", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockOfficer,
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      const result = await upsertOfficer(mockOfficer);
      expect(result).toEqual(mockOfficer);
      expect(mockFrom).toHaveBeenCalledWith("officer_profiles");

      // Verify that upsert was called with onConflict set to "tax_id"
      const upsertCall = mockFrom().upsert.mock.calls[0];
      expect(upsertCall[1]).toEqual({ onConflict: "tax_id" });
    });

    it("should update updated_at timestamp", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockOfficer,
              error: null,
            }),
          }),
        }),
      });

      const mockClient = {
        from: mockFrom,
      } as any;

      initializeSupabase("https://test.supabase.co", "test-key", mockClient);

      await upsertOfficer(mockOfficer);

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

      await expect(upsertOfficer(mockOfficer)).rejects.toThrow(
        "Failed to upsert officer"
      );
    });
  });
});
