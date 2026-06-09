import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  initializeSupabase,
  getSupabaseClient,
  resetSupabaseClient,
} from "../src/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DatabaseSchema } from "../src/types";

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
});
