export interface OfficerProfile {
  tax_id: string;
  first_name: string | null;
  last_name: string | null;
  badge_number: string | null;
  precinct_number: number | null;
  rank: string | null;
  active_allegations_count: number;
  total_allegations_count: number;
  substantiated_allegations_count: number;
  unsubstantiated_allegations_count: number;
  exonerated_allegations_count: number;
  officer_command_at_incident: string | null;
  created_at: string;
  updated_at: string;
}

export interface CCRBAllegation {
  id: string;
  complaint_id: string;
  tax_id: string;
  unique_id: string;
  fado_type: string;
  allegation: string;
  allegation_category: string;
  incident_date: string;
  incident_precinct: number | null;
  officer_command_at_incident: string;
  officer_rank_incident: string | null;
  officer_name: string | null;
  precinct_at_incident: string | null;
  board_disposition: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface FOILRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  requester_address: string | null;
  target_agency: string;
  jurisdiction: string;
  foil_case_number: string | null;
  request_type: "officer_records" | "incident_records" | "general_foil";
  related_officer_tax_id: string | null;
  incident_date_range_start: string | null;
  incident_date_range_end: string | null;
  document_description: string;
  request_submitted_date: string;
  request_deadline_date: string;
  statutory_response_days: number;
  status: "draft" | "submitted" | "acknowledged" | "processing" | "received" | "denied" | "appealed";
  response_received_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSchema {
  officer_profiles: OfficerProfile[];
  ccrb_allegations: CCRBAllegation[];
  foil_requests: FOILRequest[];
}
