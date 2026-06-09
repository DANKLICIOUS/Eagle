CREATE TABLE officer_profiles (
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
CREATE INDEX idx_officer_profiles_active_allegations ON officer_profiles(active_allegations_count DESC);
