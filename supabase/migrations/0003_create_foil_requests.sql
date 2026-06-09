CREATE TABLE foil_requests (
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
CREATE INDEX idx_foil_requests_request_deadline_date ON foil_requests(request_deadline_date);
