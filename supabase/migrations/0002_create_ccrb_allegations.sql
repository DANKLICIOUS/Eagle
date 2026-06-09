CREATE TABLE ccrb_allegations (
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
CREATE INDEX idx_ccrb_allegations_board_disposition ON ccrb_allegations(board_disposition);
