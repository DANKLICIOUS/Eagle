/**
 * NYC OpenRecords “Request a Record” fields.
 * Portal: https://a860-openrecords.nyc.gov/request/new
 * Category, agency, and title are public. Description is not public.
 */

export const OPENRECORDS_URL = 'https://a860-openrecords.nyc.gov/request/new';
export const OPENRECORDS_TITLE_MAX = 90;
export const OPENRECORDS_DESCRIPTION_MAX = 5000;

/** Category is how the portal groups agencies. Verify on the form. */
export const OPENRECORDS_CATEGORY_BY_AGENCY: Record<string, string> = {
  'New York City Police Department': 'Public Safety',
  'Civilian Complaint Review Board': 'Public Safety',
  'New York City Fire Department': 'Public Safety',
  'Department of Correction': 'Public Safety',
  'Department of Investigation': 'Public Safety',
  'Commission to Combat Police Corruption': 'Public Safety',
  'Business Integrity Commission': 'Public Safety',
  'Department of Transportation': 'Transportation',
  'Taxi and Limousine Commission': 'Transportation',
  'Department of Education': 'Education',
  'Department of Housing Preservation and Development': 'Housing and Development',
  'Department of Parks & Recreation': 'Culture and Recreation',
  "Administration for Children's Services": 'Social Services',
  'Human Resources Administration': 'Social Services',
  'Department for the Aging': 'Social Services',
  'NYC Department of Health and Mental Hygiene': 'Health',
  'Department of Environmental Protection': 'Environment',
};

export type OpenRecordsFields = {
  portal: string;
  category: string;
  agency: string;
  title: string;
  titleRemaining: number;
  description: string;
  descriptionRemaining: number;
  publicNote: string;
};

function clip(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd();
}

/** Short public title — no names, emails, badge numbers, or home addresses. */
export function openRecordsTitle(input: {
  recordTypes?: string;
  when?: string;
  place?: string;
}): string {
  const rec = (input.recordTypes || 'agency records').split(/[,;\n]/)[0]?.trim() || 'records';
  const when = (input.when || '').trim();
  const place = (input.place || '').trim();
  const raw = [rec, place, when].filter(Boolean).join(' — ');
  return clip(raw || 'FOIL records request', OPENRECORDS_TITLE_MAX);
}

export function openRecordsDescription(input: {
  numberedItems: string;
  whenDisplay: string;
  extra?: string;
}): string {
  const body = [
    'I request copies of existing records as described below.',
    input.whenDisplay ? `Approximate date range: ${input.whenDisplay}. Month and year is enough if I do not have a day.` : '',
    input.extra ? `Location or identifiers I remember: ${input.extra}.` : '',
    input.numberedItems,
    'If this does not reasonably describe the records, please say so so I can clarify.',
  ]
    .filter(Boolean)
    .join('\n\n');
  return clip(body, OPENRECORDS_DESCRIPTION_MAX);
}

export function buildOpenRecordsFields(input: {
  agencyEntity: string;
  recordTypes?: string;
  when?: string;
  whenDisplay?: string;
  place?: string;
  numberedItems: string;
}): OpenRecordsFields {
  const title = openRecordsTitle(input);
  const description = openRecordsDescription({
    numberedItems: input.numberedItems,
    whenDisplay: input.whenDisplay || input.when || '',
    extra: input.place,
  });
  return {
    portal: OPENRECORDS_URL,
    category: OPENRECORDS_CATEGORY_BY_AGENCY[input.agencyEntity] || 'Select the category that lists this agency',
    agency: input.agencyEntity,
    title,
    titleRemaining: Math.max(0, OPENRECORDS_TITLE_MAX - title.length),
    description,
    descriptionRemaining: Math.max(0, OPENRECORDS_DESCRIPTION_MAX - description.length),
    publicNote:
      'The agency, category, and title of your request will be visible to the public. Do not enter personal information in the title.',
  };
}
