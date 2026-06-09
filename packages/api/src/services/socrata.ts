import { CCRBAllegation } from "@plate/database";

interface SocrataRawRecord {
  complaint_id: string;
  unique_id: string;
  fado_type: string;
  allegation: string;
  allegation_category: string;
  incident_date: string;
  incident_precinct: number | string;
  officer_command_at_incident: string;
  officer_rank_incident: string;
  officer_name: string;
  officer_first_name: string;
  officer_last_name: string;
  tax_id?: string;
  precinct_at_incident?: string;
  board_disposition?: string;
  status?: string;
}

const SOCRATA_ENDPOINT = "https://data.cityofnewyork.us/resource/6xgr-kwjq.json";
const PAGE_SIZE = 1000;

export class SocrataService {
  static async fetchByOfficerTaxId(tax_id: string): Promise<CCRBAllegation[]> {
    const whereClause = `tax_id = '${this.escapeSql(tax_id)}'`;
    return this.fetchRecords(whereClause);
  }

  static async fetchByOfficerName(
    last_name: string,
    first_name?: string
  ): Promise<CCRBAllegation[]> {
    let whereClause = `officer_last_name = '${this.escapeSql(last_name)}'`;
    if (first_name) {
      whereClause += ` AND officer_first_name = '${this.escapeSql(first_name)}'`;
    }
    return this.fetchRecords(whereClause);
  }

  static async fetchByPrecinct(precinct_number: number): Promise<CCRBAllegation[]> {
    const whereClause = `incident_precinct = ${precinct_number}`;
    return this.fetchRecords(whereClause);
  }

  static async fetchAll(offset: number = 0): Promise<CCRBAllegation[]> {
    return this.fetchRecords("", offset);
  }

  private static async fetchRecords(
    whereClause: string,
    offset: number = 0
  ): Promise<CCRBAllegation[]> {
    const params = new URLSearchParams({
      $limit: PAGE_SIZE.toString(),
      $offset: offset.toString(),
    });

    if (whereClause) {
      params.append("$where", whereClause);
    }

    const url = `${SOCRATA_ENDPOINT}?${params.toString()}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Socrata API error: ${response.statusText}`);
      }

      const rawRecords = (await response.json()) as SocrataRawRecord[];
      return rawRecords.map((record) => this.transformRecord(record));
    } catch (error) {
      console.error("Socrata fetch error:", error);
      throw error;
    }
  }

  private static transformRecord(raw: SocrataRawRecord): CCRBAllegation {
    return {
      id: raw.unique_id || `${raw.complaint_id}-${raw.officer_name}`,
      complaint_id: raw.complaint_id,
      tax_id: raw.tax_id || "",
      unique_id: raw.unique_id,
      fado_type: raw.fado_type,
      allegation: raw.allegation,
      allegation_category: raw.allegation_category,
      incident_date: raw.incident_date,
      incident_precinct: typeof raw.incident_precinct === "string"
        ? parseInt(raw.incident_precinct, 10)
        : raw.incident_precinct,
      officer_command_at_incident: raw.officer_command_at_incident,
      officer_rank_incident: raw.officer_rank_incident,
      officer_name: raw.officer_name,
      precinct_at_incident: raw.precinct_at_incident || null,
      board_disposition: raw.board_disposition || null,
      status: raw.status || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private static escapeSql(value: string): string {
    return value.replace(/'/g, "''");
  }
}
