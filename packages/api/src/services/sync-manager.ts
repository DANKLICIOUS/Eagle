import { SocrataService, SyncStats } from "./socrata";

/**
 * Manages the full data sync pipeline for the PLATE application.
 * Orchestrates syncing data from various sources into the database.
 */
export class SyncManager {
  /**
   * Orchestrate a full sync of all data sources.
   * Currently syncs CCRB allegations from Socrata.
   *
   * @returns Object containing sync results from each data source
   * @throws Error if any sync fails
   */
  static async syncAllData(): Promise<{ socrata: SyncStats }> {
    console.log("Starting full data sync...");

    try {
      const socrataStats = await SocrataService.fullSync();

      console.log("Full data sync completed successfully");

      return {
        socrata: socrataStats,
      };
    } catch (error) {
      console.error("Full data sync failed:", error);
      throw error;
    }
  }

  /**
   * Fetch allegations for a specific officer by name.
   * Retrieves all allegations matching the officer's name from Socrata.
   *
   * @param lastName The officer's last name
   * @param firstName Optional: the officer's first name
   * @returns The count of allegations found for the officer
   * @throws Error if fetch fails
   */
  static async syncByOfficer(
    lastName: string,
    firstName?: string
  ): Promise<number> {
    console.log(
      `Syncing allegations for officer: ${firstName || ""} ${lastName}`.trim()
    );

    const allegations = await SocrataService.fetchByOfficerName(
      lastName,
      firstName
    );

    console.log(`Found ${allegations.length} allegations for officer`);

    return allegations.length;
  }
}
