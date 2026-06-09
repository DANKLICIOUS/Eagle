import { describe, it, expect, beforeEach, vi } from "vitest";
import { SocrataService, SyncStats } from "../../src/services/socrata";
import { upsertAllegation } from "@plate/database";
import type { CCRBAllegation } from "@plate/database";

// Mock the database module
vi.mock("@plate/database", () => ({
  upsertAllegation: vi.fn(),
}));

// Mock allegation data for testing
const createMockAllegation = (
  complaintId: string,
  taxId: string = "123456789",
  overrides: Partial<CCRBAllegation> = {}
): CCRBAllegation => ({
  id: `id-${complaintId}`,
  complaint_id: complaintId,
  tax_id: taxId,
  unique_id: `unique-${complaintId}`,
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
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe("SocrataService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  describe("fullSync", () => {
    it("should fetch all records with pagination", async () => {
      const page1 = Array.from({ length: 1000 }, (_, i) =>
        createMockAllegation(`CCRB-${i}`)
      );
      const page2 = Array.from({ length: 500 }, (_, i) =>
        createMockAllegation(`CCRB-1000-${i}`)
      );
      const emptyPage: CCRBAllegation[] = [];

      let callCount = 0;
      vi.stubGlobal(
        "fetch",
        vi.fn((url: string) => {
          callCount++;
          if (callCount === 1) {
            // First page
            return Promise.resolve({
              ok: true,
              json: async () => {
                // Return raw records that will be transformed
                return page1.map((a) => ({
                  complaint_id: a.complaint_id,
                  unique_id: a.unique_id,
                  fado_type: a.fado_type,
                  allegation: a.allegation,
                  allegation_category: a.allegation_category,
                  incident_date: a.incident_date,
                  incident_precinct: a.incident_precinct,
                  officer_command_at_incident: a.officer_command_at_incident,
                  officer_rank_incident: a.officer_rank_incident,
                  officer_name: a.officer_name,
                  tax_id: a.tax_id,
                  precinct_at_incident: a.precinct_at_incident,
                  board_disposition: a.board_disposition,
                  status: a.status,
                }));
              },
            } as any);
          } else if (callCount === 2) {
            // Second page
            return Promise.resolve({
              ok: true,
              json: async () =>
                page2.map((a) => ({
                  complaint_id: a.complaint_id,
                  unique_id: a.unique_id,
                  fado_type: a.fado_type,
                  allegation: a.allegation,
                  allegation_category: a.allegation_category,
                  incident_date: a.incident_date,
                  incident_precinct: a.incident_precinct,
                  officer_command_at_incident: a.officer_command_at_incident,
                  officer_rank_incident: a.officer_rank_incident,
                  officer_name: a.officer_name,
                  tax_id: a.tax_id,
                  precinct_at_incident: a.precinct_at_incident,
                  board_disposition: a.board_disposition,
                  status: a.status,
                })),
            } as any);
          } else {
            // Empty page stops pagination
            return Promise.resolve({
              ok: true,
              json: async () => emptyPage,
            } as any);
          }
        })
      );

      const mockUpsert = vi.mocked(upsertAllegation);
      mockUpsert.mockResolvedValue(createMockAllegation("any"));

      const stats = await SocrataService.fullSync();

      expect(stats.fetched).toBe(1500); // 1000 + 500
      expect(stats.upserted).toBe(1500);
      expect(stats.errors).toBe(0);
      expect(stats.duration).toBeGreaterThanOrEqual(0);
      expect(mockUpsert).toHaveBeenCalledTimes(1500);
    });

    it("should track errors for individual upsert failures without halting", async () => {
      const mockAllegations = [
        createMockAllegation("CCRB-001"),
        createMockAllegation("CCRB-002"),
        createMockAllegation("CCRB-003"),
      ];

      let callCount = 0;
      vi.stubGlobal(
        "fetch",
        vi.fn((url: string) => {
          callCount++;
          if (callCount === 1) {
            // First page with 3 records
            return Promise.resolve({
              ok: true,
              json: async () =>
                mockAllegations.map((a) => ({
                  complaint_id: a.complaint_id,
                  unique_id: a.unique_id,
                  fado_type: a.fado_type,
                  allegation: a.allegation,
                  allegation_category: a.allegation_category,
                  incident_date: a.incident_date,
                  incident_precinct: a.incident_precinct,
                  officer_command_at_incident: a.officer_command_at_incident,
                  officer_rank_incident: a.officer_rank_incident,
                  officer_name: a.officer_name,
                  tax_id: a.tax_id,
                  precinct_at_incident: a.precinct_at_incident,
                  board_disposition: a.board_disposition,
                  status: a.status,
                })),
            } as any);
          } else {
            // Empty page stops pagination
            return Promise.resolve({
              ok: true,
              json: async () => [],
            } as any);
          }
        })
      );

      const mockUpsert = vi.mocked(upsertAllegation);
      // First succeeds, second fails, third succeeds
      mockUpsert.mockResolvedValueOnce(mockAllegations[0]);
      mockUpsert.mockRejectedValueOnce(new Error("Database error"));
      mockUpsert.mockResolvedValueOnce(mockAllegations[2]);

      const stats = await SocrataService.fullSync();

      expect(stats.fetched).toBe(3);
      expect(stats.upserted).toBe(2);
      expect(stats.errors).toBe(1);
      expect(stats.fetched).toBe(stats.upserted + stats.errors); // Verify invariant
    });

    it("should halt and throw on network error during pagination", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.reject(new Error("Network error")))
      );

      const mockUpsert = vi.mocked(upsertAllegation);
      mockUpsert.mockResolvedValue(createMockAllegation("any"));

      await expect(SocrataService.fullSync()).rejects.toThrow("Network error");
    });

    it("should halt and throw on API error response", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve({
            ok: false,
            statusText: "Internal Server Error",
          } as any)
        )
      );

      const mockUpsert = vi.mocked(upsertAllegation);
      mockUpsert.mockResolvedValue(createMockAllegation("any"));

      await expect(SocrataService.fullSync()).rejects.toThrow(
        "Socrata API error"
      );
    });

    it("should properly transform Socrata records to CCRBAllegation", async () => {
      let callCount = 0;
      vi.stubGlobal(
        "fetch",
        vi.fn((url: string) => {
          callCount++;
          if (callCount === 1) {
            // Return raw Socrata record with incident_precinct as a string
            return Promise.resolve({
              ok: true,
              json: async () => [
                {
                  complaint_id: "CCRB-001",
                  unique_id: "UNIQUE-001",
                  fado_type: "Force",
                  allegation: "Excessive force",
                  allegation_category: "Physical Abuse",
                  incident_date: "2024-01-15",
                  incident_precinct: "42", // String in raw data
                  officer_command_at_incident: "Patrol",
                  officer_rank_incident: "Officer",
                  officer_name: "John Doe",
                  tax_id: "123456789",
                  precinct_at_incident: "1",
                  board_disposition: "Substantiated",
                  status: "closed",
                },
              ],
            } as any);
          } else {
            return Promise.resolve({
              ok: true,
              json: async () => [],
            } as any);
          }
        })
      );

      const mockUpsert = vi.mocked(upsertAllegation);
      mockUpsert.mockResolvedValue(createMockAllegation("CCRB-001"));

      await SocrataService.fullSync();

      // Verify that upsert was called with transformed data
      expect(mockUpsert).toHaveBeenCalledWith(expect.any(Object));
      const upsertedData = mockUpsert.mock.calls[0][0];

      // Check key transformations
      expect(upsertedData).toHaveProperty("complaint_id", "CCRB-001");
      expect(upsertedData).toHaveProperty("tax_id", "123456789");
      expect(upsertedData).toHaveProperty("created_at");
      expect(upsertedData).toHaveProperty("updated_at");

      // Verify incident_precinct was converted from string to number
      expect(upsertedData.incident_precinct).toBe(42);
      expect(typeof upsertedData.incident_precinct).toBe("number");
    });

    it("should handle SQL escaping in officer names (e.g., O'Brien)", async () => {
      let capturedUrl = "";
      vi.stubGlobal(
        "fetch",
        vi.fn((url: string) => {
          capturedUrl = url;
          return Promise.resolve({
            ok: true,
            json: async () => [],
          } as any);
        })
      );

      const mockUpsert = vi.mocked(upsertAllegation);
      mockUpsert.mockResolvedValue(createMockAllegation("any"));

      // Fetch by officer name with apostrophe
      await SocrataService.fetchByOfficerName("O'Brien");

      // Verify that the apostrophe was escaped to double-apostrophe in the SQL where clause
      // URLSearchParams encodes spaces as + and quotes as %27, but the key test is
      // that the single quote was doubled when building the SQL where clause
      const decodedUrl = decodeURIComponent(capturedUrl).replace(/\+/g, " ");
      expect(decodedUrl).toContain("officer_last_name = 'O''Brien'");
    });

    it("should return accurate timing information", async () => {
      const emptyPage: any[] = [];

      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve({
            ok: true,
            json: async () => emptyPage,
          } as any)
        )
      );

      const mockUpsert = vi.mocked(upsertAllegation);
      mockUpsert.mockResolvedValue(createMockAllegation("any"));

      const stats = await SocrataService.fullSync();

      expect(stats.duration).toBeGreaterThanOrEqual(0);
      expect(typeof stats.duration).toBe("number");
    });

    it("should log progress during sync", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation();
      const page1 = [createMockAllegation("CCRB-001")];
      const emptyPage: any[] = [];

      vi.stubGlobal(
        "fetch",
        vi.fn((url: string) => {
          const offset = url.includes("$offset=0") ? 0 : 1000;
          if (offset === 0) {
            return Promise.resolve({
              ok: true,
              json: async () =>
                page1.map((a) => ({
                  complaint_id: a.complaint_id,
                  unique_id: a.unique_id,
                  fado_type: a.fado_type,
                  allegation: a.allegation,
                  allegation_category: a.allegation_category,
                  incident_date: a.incident_date,
                  incident_precinct: a.incident_precinct,
                  officer_command_at_incident: a.officer_command_at_incident,
                  officer_rank_incident: a.officer_rank_incident,
                  officer_name: a.officer_name,
                  tax_id: a.tax_id,
                  precinct_at_incident: a.precinct_at_incident,
                  board_disposition: a.board_disposition,
                  status: a.status,
                })),
            } as any);
          } else {
            return Promise.resolve({
              ok: true,
              json: async () => emptyPage,
            } as any);
          }
        })
      );

      const mockUpsert = vi.mocked(upsertAllegation);
      mockUpsert.mockResolvedValue(page1[0]);

      await SocrataService.fullSync();

      const logCalls = consoleSpy.mock.calls.map((call) => call[0]);
      expect(logCalls.some((log) => log.includes("Fetching Socrata records"))).toBe(true);
      expect(logCalls.some((log) => log.includes("sync complete"))).toBe(true);

      consoleSpy.mockRestore();
    });
  });
});
