import {
  createClient,
  SupabaseClient,
} from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize the Supabase client as a singleton.
 * Must be called once before any database operations.
 *
 * @param url - The Supabase project URL
 * @param key - The Supabase anon/service role key
 * @param client - Optional pre-built client for testing
 * @throws Error if already initialized
 */
export function initializeSupabase(
  url: string,
  key: string,
  client?: SupabaseClient
): void {
  if (supabaseClient !== null) {
    throw new Error("Supabase client is already initialized");
  }

  if (client) {
    supabaseClient = client;
  } else {
    supabaseClient = createClient(url, key);
  }
}

/**
 * Get the initialized Supabase client.
 *
 * @returns The Supabase client
 * @throws Error if client has not been initialized
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient === null) {
    throw new Error(
      "Supabase client has not been initialized. Call initializeSupabase() first."
    );
  }

  return supabaseClient;
}

/**
 * Reset the Supabase client. Used for testing to ensure clean state.
 * @internal
 */
export function resetSupabaseClient(): void {
  supabaseClient = null;
}
