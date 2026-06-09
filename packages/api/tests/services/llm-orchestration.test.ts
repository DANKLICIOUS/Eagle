import { describe, it, expect, beforeEach, vi } from "vitest";
import type { CCRBAllegation, OfficerProfile } from "@plate/database";

// Mock config module first
vi.mock("../../src/config", () => ({
  config: {
    anthropic: { apiKey: "test-key" },
    supabase: { url: "test-url", anonKey: "test-anonkey" },
    environment: "test",
  },
  validateConfig: vi.fn(),
}));

// Mock Anthropic SDK with closure to capture create function
vi.mock("@anthropic-ai/sdk", () => {
  let createMock: ReturnType<typeof vi.fn> | null = null;

  return {
    default: vi.fn(function() {
      // Initialize create function on first call
      if (!createMock) {
        createMock = vi.fn();
      }
      this.messages = {
        create: createMock,
        _getMockCreate: () => createMock,  // Expose for tests
      };
      return this;
    }),
    _getMockCreate: () => createMock,
  };
});

// Now import after mocks are set up
import { LLMOrchestration } from "../../src/services/llm-orchestration";
import Anthropic from "@anthropic-ai/sdk";

// Create mock data helpers
const createMockAllegation = (
  complaintId: string,
  overrides: Partial<CCRBAllegation> = {}
): CCRBAllegation => ({
  id: `id-${complaintId}`,
  complaint_id: complaintId,
  tax_id: "123456789",
  unique_id: `unique-${complaintId}`,
  fado_type: "Force",
  allegation: "Excessive force during arrest",
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

const createMockOfficer = (
  overrides: Partial<OfficerProfile> = {}
): OfficerProfile => ({
  tax_id: "123456789",
  first_name: "John",
  last_name: "Doe",
  badge_number: "12345",
  precinct_number: 1,
  rank: "Officer",
  active_allegations_count: 5,
  total_allegations_count: 10,
  substantiated_allegations_count: 3,
  unsubstantiated_allegations_count: 5,
  exonerated_allegations_count: 2,
  officer_command_at_incident: "Patrol",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

describe("LLMOrchestration", () => {
  beforeEach(() => {
    // Create a new instance to initialize the mock
    const instance = new (Anthropic as any)();
    // Access the create function from the instance
    const mockCreate = instance.messages.create;
    // Clear any previous call history
    if (mockCreate.mockClear) {
      mockCreate.mockClear();
    }
  });

  describe("analyzeAllegations", () => {
    it("should return empty analysis for empty allegations array", async () => {
      const officer = createMockOfficer();
      const result = await LLMOrchestration.analyzeAllegations([], officer);

      expect(result).toEqual({
        summary: "No allegations to analyze",
        pattern: "N/A",
        riskFactors: [],
        recommendations: [],
      });
    });

    it("should analyze allegations with Claude and return legal analysis", async () => {
      const mockAllegations = [
        createMockAllegation("CCRB-001", { fado_type: "Force", board_disposition: "Substantiated" }),
        createMockAllegation("CCRB-002", { fado_type: "Conduct", board_disposition: "Substantiated" }),
      ];
      const mockOfficer = createMockOfficer();

      const mockResponse = {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              summary: "Pattern of excessive force",
              pattern: "Officer consistently uses force in low-threat situations",
              riskFactors: ["High complaint volume", "Escalation pattern"],
              recommendations: ["Retraining required", "Desk duty pending review"],
            }),
          },
        ],
      };

      const instance = new (Anthropic as any)();
      const mockCreate = instance.messages.create;
      mockCreate.mockResolvedValue(mockResponse);

      const result = await LLMOrchestration.analyzeAllegations(mockAllegations, mockOfficer);

      expect(result.summary).toBe("Pattern of excessive force");
      expect(result.riskFactors).toHaveLength(2);
      expect(result.recommendations).toHaveLength(2);
    });

    it("should throw on Claude API error", async () => {
      const mockAllegations = [createMockAllegation("CCRB-001")];
      const mockOfficer = createMockOfficer();
      const mockError = new Error("API rate limit exceeded");

      const instance = new (Anthropic as any)();
      const mockCreate = instance.messages.create;
      mockCreate.mockRejectedValue(mockError);

      await expect(
        LLMOrchestration.analyzeAllegations(mockAllegations, mockOfficer)
      ).rejects.toThrow("API rate limit exceeded");
    });

    it("should parse JSON from markdown code blocks", async () => {
      const mockAllegations = [createMockAllegation("CCRB-001")];
      const mockOfficer = createMockOfficer();

      const mockResponse = {
        content: [
          {
            type: "text" as const,
            text: '```json\n{"summary": "test summary", "pattern": "test pattern", "riskFactors": [], "recommendations": []}\n```',
          },
        ],
      };

      const instance = new (Anthropic as any)();
      const mockCreate = instance.messages.create;
      mockCreate.mockResolvedValue(mockResponse);

      const result = await LLMOrchestration.analyzeAllegations(mockAllegations, mockOfficer);

      expect(result.summary).toBe("test summary");
      expect(result.pattern).toBe("test pattern");
    });

    it("should throw on malformed Claude response", async () => {
      const mockAllegations = [createMockAllegation("CCRB-001")];
      const mockOfficer = createMockOfficer();

      const mockResponse = {
        content: [
          {
            type: "text" as const,
            text: "{ invalid json ]",
          },
        ],
      };

      const instance = new (Anthropic as any)();
      const mockCreate = instance.messages.create;
      mockCreate.mockResolvedValue(mockResponse);

      await expect(
        LLMOrchestration.analyzeAllegations(mockAllegations, mockOfficer)
      ).rejects.toThrow();
    });
  });

  describe("generateFOILContext", () => {
    it("should return empty context for no substantiated allegations", async () => {
      const officer = createMockOfficer();

      const allegations = [
        createMockAllegation("CCRB-001", { board_disposition: "Unsubstantiated" }),
        createMockAllegation("CCRB-002", { board_disposition: "Exonerated" }),
      ];

      const result = await LLMOrchestration.generateFOILContext(officer, allegations);

      expect(result).toEqual({
        officerMisconduct: "No substantiated allegations found",
        misconduct_examples: [],
        legal_arguments: [],
        evidence_gaps: [],
      });
    });

    it("should generate FOIL context with substantiated allegations only", async () => {
      const mockAllegations = [
        createMockAllegation("CCRB-001", { board_disposition: "Substantiated" }),
        createMockAllegation("CCRB-002", { board_disposition: "Unsubstantiated" }),
      ];
      const mockOfficer = createMockOfficer();

      const mockResponse = {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              officerMisconduct: "Officer has pattern of substantiated misconduct",
              misconduct_examples: ["Example 1", "Example 2"],
              legal_arguments: ["NY § 84 requires disclosure of officer records", "NY § 87 exceptions do not apply to this case"],
              evidence_gaps: ["BWC footage missing", "Dispatch logs incomplete"],
            }),
          },
        ],
      };

      const instance = new (Anthropic as any)();
      const mockCreate = instance.messages.create;
      mockCreate.mockResolvedValue(mockResponse);

      const result = await LLMOrchestration.generateFOILContext(mockOfficer, mockAllegations);

      expect(result.legal_arguments.some((arg: string) => arg.includes("§"))).toBe(true);
      expect(result.misconduct_examples).toHaveLength(2);
      expect(result.evidence_gaps).toHaveLength(2);
    });
  });
});
