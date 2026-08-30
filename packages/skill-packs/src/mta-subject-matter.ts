/**
 * Official MTA FOIL subject-matter headings used for NYCT fare-evasion drafts.
 * Source of truth: https://www.mta.info/transparency/foil/agency-subject-matter-lists
 * Page noted “Updated Nov 20, 2024”. Verify before you file.
 */

export const MTA_SUBJECT_LIST_URL =
  'https://www.mta.info/transparency/foil/agency-subject-matter-lists';

export type SubjectHeading = {
  heading: string;
  list: 'New York City Transit' | 'MTA Headquarters';
  note?: string;
};

/** Fare-evasion subset — exact labels from the published lists. */
export const NYCT_FARE_EVASION_HEADINGS: SubjectHeading[] = [
  { heading: 'Accidents, injury and tort files', list: 'New York City Transit' },
  { heading: 'Complaints', list: 'New York City Transit' },
  { heading: 'Dispatch records', list: 'New York City Transit' },
  {
    heading: 'Disciplinary records',
    list: 'New York City Transit',
    note: 'You ask only for existing staff files. They may be withheld in part.',
  },
  { heading: 'Investigations', list: 'New York City Transit' },
  { heading: 'Passenger traffic records', list: 'New York City Transit' },
  { heading: 'Photographs', list: 'New York City Transit' },
  { heading: 'Videos', list: 'New York City Transit' },
  {
    heading: 'POLICE INCIDENT REPORTS',
    list: 'MTA Headquarters',
    note: 'MTA HQ / MTA PD pile — not the same as station CCTV on the NYCT list.',
  },
  {
    heading: 'POLICE MEMO BOOKS',
    list: 'MTA Headquarters',
    note: 'MTA HQ / MTA PD pile — not the same as station CCTV on the NYCT list.',
  },
  {
    heading: 'POLICE RADIO RUNS',
    list: 'MTA Headquarters',
    note: 'MTA HQ / MTA PD pile — not the same as station CCTV on the NYCT list.',
  },
  {
    heading: 'POLICE SUMMONS RECORDS',
    list: 'MTA Headquarters',
    note: 'MTA HQ / MTA PD pile — not the same as station CCTV on the NYCT list.',
  },
];

export function fareEvasionHeadingLines(whenDisplay: string, whereWho: string): string[] {
  const place = [whenDisplay, whereWho].filter(Boolean).join('; ');
  return NYCT_FARE_EVASION_HEADINGS.map((h, i) => {
    const extra = h.note ? ` (${h.note})` : '';
    return `  ${i + 1}. ${h.heading} [${h.list} subject-matter list]${extra}${place ? ` — ${place}` : ''}`;
  });
}
