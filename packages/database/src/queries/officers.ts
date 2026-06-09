import { getSupabaseClient } from "../client";
import { OfficerProfile } from "../types";

/**
 * Retrieve an officer profile by tax ID.
 *
 * @param taxId - The officer's tax ID (9-digit NYPD identifier)
 * @returns The officer profile or null if not found
 * @throws Error on database errors (not on 404)
 */
export async function getOfficerByTaxId(
  taxId: string
): Promise<OfficerProfile | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("officer_profiles")
    .select("*")
    .eq("tax_id", taxId)
    .single();

  if (error) {
    // PGRST116 is the "not found" error code for .single()
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(
      `Failed to fetch officer with tax_id ${taxId}: ${error.message}`
    );
  }

  return data as OfficerProfile;
}

/**
 * Retrieve officers by last name.
 *
 * @param lastName - The officer's last name
 * @returns Array of officer profiles, ordered by active allegations (descending)
 * @throws Error on database errors
 */
export async function getOfficersByLastName(
  lastName: string
): Promise<OfficerProfile[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("officer_profiles")
    .select("*")
    .eq("last_name", lastName)
    .order("active_allegations_count", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to fetch officers with last_name ${lastName}: ${error.message}`
    );
  }

  return (data as OfficerProfile[]) || [];
}

/**
 * Retrieve officers by precinct number.
 *
 * @param precinct - The precinct number
 * @returns Array of officer profiles, ordered by active allegations (descending)
 * @throws Error on database errors
 */
export async function getOfficersByPrecinct(
  precinct: number
): Promise<OfficerProfile[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("officer_profiles")
    .select("*")
    .eq("precinct_number", precinct)
    .order("active_allegations_count", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to fetch officers with precinct_number ${precinct}: ${error.message}`
    );
  }

  return (data as OfficerProfile[]) || [];
}

/**
 * Insert or update an officer profile.
 * Uses tax_id as the primary key and will update existing records on conflict.
 *
 * @param officer - The officer profile to insert or update
 * @returns The inserted or updated officer profile
 * @throws Error on database errors
 */
export async function upsertOfficer(
  officer: OfficerProfile
): Promise<OfficerProfile> {
  const client = getSupabaseClient();

  // Ensure updated_at is set to current timestamp
  const officerData = {
    ...officer,
    updated_at: new Date().toISOString(),
  };

  const result: any = await (client as any)
    .from("officer_profiles")
    .upsert([officerData], { onConflict: "tax_id" })
    .select()
    .single();

  if (result.error) {
    throw new Error(
      `Failed to upsert officer with tax_id ${officer.tax_id}: ${result.error.message}`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result.data;
}
