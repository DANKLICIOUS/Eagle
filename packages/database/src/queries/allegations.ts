import { getSupabaseClient } from "../client";
import { CCRBAllegation } from "../types";

/**
 * Statistics about an officer's allegations.
 */
export interface AllegationStats {
  total: number;
  substantiated: number;
  unsubstantiated: number;
  exonerated: number;
}

/**
 * Retrieve all allegations for an officer by tax ID.
 *
 * @param taxId - The officer's tax ID (9-digit NYPD identifier)
 * @returns Array of allegations, ordered by incident date (descending)
 * @throws Error on database errors
 */
export async function getAllegationsByOfficerTaxId(
  taxId: string
): Promise<CCRBAllegation[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("ccrb_allegations")
    .select("*")
    .eq("tax_id", taxId)
    .order("incident_date", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(
      `Failed to fetch allegations for tax_id ${taxId}: ${error.message}`
    );
  }

  return (data as CCRBAllegation[]) || [];
}

/**
 * Retrieve a single allegation by complaint ID.
 *
 * @param complaintId - The CCRB complaint ID
 * @returns The allegation or null if not found
 * @throws Error on database errors (not on 404)
 */
export async function getAllegationByComplaintId(
  complaintId: string
): Promise<CCRBAllegation | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("ccrb_allegations")
    .select("*")
    .eq("complaint_id", complaintId)
    .single();

  if (error) {
    // PGRST116 is the "not found" error code for .single()
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(
      `Failed to fetch allegation with complaint_id ${complaintId}: ${error.message}`
    );
  }

  return data as CCRBAllegation;
}

/**
 * Insert or update an allegation.
 * Uses complaint_id as the conflict resolution key and will update existing records on conflict.
 *
 * @param allegation - The allegation to insert or update
 * @returns The inserted or updated allegation
 * @throws Error on database errors
 */
export async function upsertAllegation(
  allegation: CCRBAllegation
): Promise<CCRBAllegation> {
  const client = getSupabaseClient();

  // Ensure updated_at is set to current timestamp
  const allegationData = {
    ...allegation,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from("ccrb_allegations")
    .upsert([allegationData], { onConflict: "complaint_id" })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to upsert allegation with complaint_id ${allegation.complaint_id}: ${error.message}`
    );
  }

  return data as CCRBAllegation;
}

/**
 * Get statistics about an officer's allegations.
 * Computes stats by examining all allegations for the officer and categorizing by board_disposition.
 *
 * @param taxId - The officer's tax ID (9-digit NYPD identifier)
 * @returns Allegation statistics
 * @throws Error on database errors
 */
export async function getAllegationStats(
  taxId: string
): Promise<AllegationStats> {
  const allegations = await getAllegationsByOfficerTaxId(taxId);

  let substantiated = 0;
  let unsubstantiated = 0;
  let exonerated = 0;

  for (const allegation of allegations) {
    const disposition = allegation.board_disposition?.toLowerCase() || "";

    // Match exactly to avoid "substantiated" matching "unsubstantiated"
    if (disposition === "substantiated") {
      substantiated++;
    } else if (disposition === "unsubstantiated") {
      unsubstantiated++;
    } else if (disposition === "exonerated") {
      exonerated++;
    }
  }

  return {
    total: allegations.length,
    substantiated,
    unsubstantiated,
    exonerated,
  };
}
