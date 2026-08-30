/**
 * NYS DCJS criminal-history desks. Two different paths:
 * - Your own record: IdentoGO fingerprints + service code (not FOIL, not the agency PDF).
 * - Agency CHRI access: official PDF, submit to DCJS Legal. Not for individuals.
 * Source: https://criminaljustice.ny.gov/request-your-new-york-state-criminal-history
 */

export const DCJS_RECORD_REVIEW_URL =
  'https://criminaljustice.ny.gov/request-your-new-york-state-criminal-history';
export const IDENTOGO_URL = 'https://uenroll.identogo.com/';
export const IDENTOGO_PHONE = '877-472-6915';

/** Living in New York State (Queens or Manhattan does not change these). */
export const DCJS_SERVICE_CODES = {
  suppressed: { code: '15464Z', label: 'Suppressed record' },
  unsuppressed: { code: '15465F', label: 'Unsuppressed record' },
} as const;

export const DCJS_RECORD_REVIEW_FEE = {
  inStateUsd: 17.5,
  outOfStateUsd: 57.45,
  asOf: '2026-02-02',
  payTo: 'Idemia',
} as const;

export const DCJS_CHRI_ACCESS = {
  formUrl:
    'https://criminaljustice.ny.gov/system/files/documents/2026/05/request-for-access-to-criminal-history-re.pdf',
  templatePath: '/forms/dcjs-chri-access-fillable.pdf',
  submitEmail: 'dcjslegalservices@dcjs.ny.gov',
  submitSubject: 'Request for Access to Criminal History Record Information',
  legalPhone: '(518) 457-8413',
  udPhone: '(518) 485-8434',
  note: 'This form is not to be used by an individual to request a copy of his or her criminal history.',
} as const;

export type DcjsServiceCodeId = keyof typeof DCJS_SERVICE_CODES;

export type DcjsChriPurpose = 'employment' | 'law_enforcement' | 'other' | '';
export type DcjsChriScope = 'nys' | 'nys_fbi' | '';

export type DcjsChriAnswers = {
  agencyName: string;
  address: string;
  cityState: string;
  contactName: string;
  contactPhone: string;
  email: string;
  hasUDAgreement: boolean;
  ori: string;
  purpose: DcjsChriPurpose;
  scope: DcjsChriScope;
  explain: string;
  purposeDetail: string;
  authFederal: boolean;
  authState: boolean;
  authLocal: boolean;
};

export const DCJS_CHRI_EMPTY: DcjsChriAnswers = {
  agencyName: '',
  address: '',
  cityState: '',
  contactName: '',
  contactPhone: '',
  email: '',
  hasUDAgreement: false,
  ori: '',
  purpose: '',
  scope: '',
  explain: '',
  purposeDetail: '',
  authFederal: false,
  authState: false,
  authLocal: false,
};

/** Exact AcroForm names on the May 2026 DCJS CHRI access PDF. */
export const DCJS_CHRI_FIELDS = {
  agencyName: 'Agency Name',
  address: 'Address:',
  cityState: 'City & State',
  contactName: 'Contact Name',
  contactPhone: 'Contact Phone No',
  email: 'Email',
  hasUD: 'Please select if Agency currently has a Use and Dissemination Agreement with DCJS',
  ori: 'Agencies ORI #:',
  employment: 'Please select if Agency is requesting access to CHRI for employmentlicensing',
  employmentNys: 'NYS CHRI Only',
  employmentFbi: 'NYS  FBI CHRI',
  law: 'Please select if Agency is requesting access to CHRI for law enforcementcriminal',
  lawNys: 'NYS CHRI Only_2',
  lawFbi: 'NYS  FBI CHRI_2',
  other: 'Please select if Agency is requesting access to CHRI for a reason not listed above',
  otherNys: 'NYS CHRI Only_3',
  otherFbi: 'NYS  FBI CHRI_3',
  explain: ['Please explain 1', 'Please explain 2', 'Please explain 3'] as const,
  federal: 'Federal Law or Regulation',
  state: 'State Law',
  local: 'Local Law',
  purpose: [
    'Please describe in detail the purpose of this request 1',
    'Please describe in detail the purpose of this request 2',
    'Please describe in detail the purpose of this request 3',
    'Please describe in detail the purpose of this request 4',
  ] as const,
} as const;

export function splitFormLines(text: string, rows: number, width = 92): string[] {
  const words = (text || '').trim().split(/\s+/).filter(Boolean);
  const lines: string[] = Array.from({ length: rows }, () => '');
  let i = 0;
  for (const w of words) {
    if (i >= rows) break;
    const next = lines[i] ? `${lines[i]} ${w}` : w;
    if (next.length <= width) lines[i] = next;
    else {
      i += 1;
      if (i < rows) lines[i] = w;
    }
  }
  return lines;
}

export function dcjsChriTextValues(a: DcjsChriAnswers): Record<string, string> {
  const explain = splitFormLines(a.explain, 3);
  const purpose = splitFormLines(a.purposeDetail, 4);
  return {
    [DCJS_CHRI_FIELDS.agencyName]: a.agencyName,
    [DCJS_CHRI_FIELDS.address]: a.address,
    [DCJS_CHRI_FIELDS.cityState]: a.cityState,
    [DCJS_CHRI_FIELDS.contactName]: a.contactName,
    [DCJS_CHRI_FIELDS.contactPhone]: a.contactPhone,
    [DCJS_CHRI_FIELDS.email]: a.email,
    [DCJS_CHRI_FIELDS.ori]: a.ori,
    [DCJS_CHRI_FIELDS.explain[0]]: explain[0],
    [DCJS_CHRI_FIELDS.explain[1]]: explain[1],
    [DCJS_CHRI_FIELDS.explain[2]]: explain[2],
    [DCJS_CHRI_FIELDS.purpose[0]]: purpose[0],
    [DCJS_CHRI_FIELDS.purpose[1]]: purpose[1],
    [DCJS_CHRI_FIELDS.purpose[2]]: purpose[2],
    [DCJS_CHRI_FIELDS.purpose[3]]: purpose[3],
  };
}

export function dcjsChriChecks(a: DcjsChriAnswers): string[] {
  const on: string[] = [];
  if (a.hasUDAgreement) on.push(DCJS_CHRI_FIELDS.hasUD);
  if (a.purpose === 'employment') {
    on.push(DCJS_CHRI_FIELDS.employment);
    if (a.scope === 'nys') on.push(DCJS_CHRI_FIELDS.employmentNys);
    if (a.scope === 'nys_fbi') on.push(DCJS_CHRI_FIELDS.employmentFbi);
  }
  if (a.purpose === 'law_enforcement') {
    on.push(DCJS_CHRI_FIELDS.law);
    if (a.scope === 'nys') on.push(DCJS_CHRI_FIELDS.lawNys);
    if (a.scope === 'nys_fbi') on.push(DCJS_CHRI_FIELDS.lawFbi);
  }
  if (a.purpose === 'other') {
    on.push(DCJS_CHRI_FIELDS.other);
    if (a.scope === 'nys') on.push(DCJS_CHRI_FIELDS.otherNys);
    if (a.scope === 'nys_fbi') on.push(DCJS_CHRI_FIELDS.otherFbi);
  }
  if (a.authFederal) on.push(DCJS_CHRI_FIELDS.federal);
  if (a.authState) on.push(DCJS_CHRI_FIELDS.state);
  if (a.authLocal) on.push(DCJS_CHRI_FIELDS.local);
  return on;
}

export function dcjsMailto(a: DcjsChriAnswers): string {
  const body = [
    'Please find the attached Request for Access to Criminal History Record Information (CHRI).',
    '',
    `Agency: ${a.agencyName || '[agency name]'}`,
    `Contact: ${a.contactName || '[contact]'} ${a.email || ''}`.trim(),
    '',
    'Attach the filled PDF before you send.',
  ].join('\n');
  return `mailto:${DCJS_CHRI_ACCESS.submitEmail}?subject=${encodeURIComponent(
    DCJS_CHRI_ACCESS.submitSubject
  )}&body=${encodeURIComponent(body)}`;
}

export function isCriminalHistoryMatter(recordTypes: string, agency = ''): boolean {
  return (
    /\bcriminal history\b|\bbackground check\b|\brap sheet\b|\bnysid\b|\bdcjs\b/i.test(
      recordTypes || ''
    ) || /division of criminal justice services|\bdcjs\b/i.test(agency || '')
  );
}
