import { SupabaseClient } from "@supabase/supabase-js";

const migrations = [
  {
    version: "0001",
    name: "create_officer_profiles",
    sql: `CREATE TABLE officer_profiles (
      tax_id VARCHAR(9) PRIMARY KEY,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      badge_number VARCHAR(50),
      precinct_number INTEGER,
      rank VARCHAR(100),
      active_allegations_count INTEGER DEFAULT 0,
      total_allegations_count INTEGER DEFAULT 0,
      substantiated_allegations_count INTEGER DEFAULT 0,
      unsubstantiated_allegations_count INTEGER DEFAULT 0,
      exonerated_allegations_count INTEGER DEFAULT 0,
      officer_command_at_incident VARCHAR(500),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_officer_profiles_last_name ON officer_profiles(last_name);
    CREATE INDEX idx_officer_profiles_badge_number ON officer_profiles(badge_number);
    CREATE INDEX idx_officer_profiles_precinct_number ON officer_profiles(precinct_number);
    CREATE INDEX idx_officer_profiles_active_allegations ON officer_profiles(active_allegations_count DESC);`,
  },
  {
    version: "0002",
    name: "create_ccrb_allegations",
    sql: `CREATE TABLE ccrb_allegations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      complaint_id VARCHAR(100) NOT NULL UNIQUE,
      tax_id VARCHAR(9) NOT NULL REFERENCES officer_profiles(tax_id) ON DELETE CASCADE,
      unique_id VARCHAR(100),
      fado_type VARCHAR(100),
      allegation VARCHAR(500) NOT NULL,
      allegation_category VARCHAR(255),
      incident_date DATE,
      incident_precinct INTEGER,
      officer_command_at_incident VARCHAR(500),
      officer_rank_incident VARCHAR(100),
      officer_name VARCHAR(255),
      precinct_at_incident VARCHAR(100),
      board_disposition VARCHAR(255),
      status VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_ccrb_allegations_tax_id ON ccrb_allegations(tax_id);
    CREATE INDEX idx_ccrb_allegations_complaint_id ON ccrb_allegations(complaint_id);
    CREATE INDEX idx_ccrb_allegations_incident_date ON ccrb_allegations(incident_date DESC);
    CREATE INDEX idx_ccrb_allegations_status ON ccrb_allegations(status);
    CREATE INDEX idx_ccrb_allegations_fado_type ON ccrb_allegations(fado_type);
    CREATE INDEX idx_ccrb_allegations_board_disposition ON ccrb_allegations(board_disposition);`,
  },
  {
    version: "0003",
    name: "create_foil_requests",
    sql: `CREATE TABLE foil_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      requester_name VARCHAR(255) NOT NULL,
      requester_email VARCHAR(255) NOT NULL,
      requester_phone VARCHAR(20),
      requester_address TEXT,
      target_agency VARCHAR(255) NOT NULL,
      jurisdiction VARCHAR(100) NOT NULL,
      foil_case_number VARCHAR(100),
      request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('officer_records', 'incident_records', 'general_foil')),
      related_officer_tax_id VARCHAR(9) REFERENCES officer_profiles(tax_id) ON DELETE SET NULL,
      incident_date_range_start DATE,
      incident_date_range_end DATE,
      document_description TEXT NOT NULL,
      request_submitted_date DATE NOT NULL,
      request_deadline_date DATE NOT NULL,
      statutory_response_days INTEGER,
      status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged', 'processing', 'received', 'denied', 'appealed')),
      response_received_date DATE,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_foil_requests_requester_email ON foil_requests(requester_email);
    CREATE INDEX idx_foil_requests_target_agency ON foil_requests(target_agency);
    CREATE INDEX idx_foil_requests_status ON foil_requests(status);
    CREATE INDEX idx_foil_requests_related_officer_tax_id ON foil_requests(related_officer_tax_id);
    CREATE INDEX idx_foil_requests_request_submitted_date ON foil_requests(request_submitted_date DESC);
    CREATE INDEX idx_foil_requests_request_deadline_date ON foil_requests(request_deadline_date);`,
  },
];

export async function runMigrations(supabase: SupabaseClient) {
  for (const migration of migrations) {
    const { data: existing } = await supabase
      .from("schema_migrations")
      .select("version")
      .eq("version", migration.version)
      .single();

    if (!existing) {
      const { error } = await supabase.rpc("exec", { sql: migration.sql });
      if (error) throw error;

      await supabase.from("schema_migrations").insert({
        version: migration.version,
        name: migration.name,
        executed_at: new Date().toISOString(),
      });

      console.log(`✓ Migration ${migration.version} applied`);
    }
  }
}
