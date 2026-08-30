/** Demo data for frontend immersion; replace with API when backend is running. */

export type OfficerCard = {
  taxId: string;
  firstName: string;
  lastName: string;
  badgeNumber: string;
  precinct: string;
  rank: string;
  totalAllegations: number;
  substantiated: number;
  active: number;
};

export const DEMO_OFFICERS: OfficerCard[] = [
  {
    taxId: '912345678',
    firstName: 'Alex',
    lastName: 'Rivera',
    badgeNumber: '2841',
    precinct: '073',
    rank: 'Police Officer',
    totalAllegations: 7,
    substantiated: 1,
    active: 2,
  },
  {
    taxId: '923456789',
    firstName: 'Jordan',
    lastName: 'Chen',
    badgeNumber: '1190',
    precinct: '040',
    rank: 'Detective',
    totalAllegations: 3,
    substantiated: 0,
    active: 1,
  },
  {
    taxId: '934567890',
    firstName: 'Sam',
    lastName: 'Okoro',
    badgeNumber: '5520',
    precinct: '120',
    rank: 'Sergeant',
    totalAllegations: 12,
    substantiated: 2,
    active: 0,
  },
];

export type VaultItem = {
  id: string;
  name: string;
  kind: 'pdf' | 'image' | 'note' | 'video';
  sizeLabel: string;
  updatedAt: string;
  encrypted: boolean;
};

export const DEMO_VAULT: VaultItem[] = [
  {
    id: 'v1',
    name: 'Incident notes — draft',
    kind: 'note',
    sizeLabel: '12 KB',
    updatedAt: '2026-08-01',
    encrypted: true,
  },
  {
    id: 'v2',
    name: 'Medical visit summary.pdf',
    kind: 'pdf',
    sizeLabel: '240 KB',
    updatedAt: '2026-07-28',
    encrypted: true,
  },
  {
    id: 'v3',
    name: 'Street camera stills',
    kind: 'image',
    sizeLabel: '4.1 MB',
    updatedAt: '2026-07-22',
    encrypted: true,
  },
];

export type ResearchItem = {
  id: string;
  title: string;
  source: string;
  year: string;
  jurisdiction: string;
  publicDomain: boolean;
  summary: string;
};

export const DEMO_RESEARCH: ResearchItem[] = [
  {
    id: 'r1',
    title: 'NY Public Officers Law Article 6 — FOIL',
    source: 'New York State Legislature (public statute)',
    year: 'as amended',
    jurisdiction: 'New York',
    publicDomain: true,
    summary:
      'Statutory framework for public access to agency records, exemptions, and response timelines.',
  },
  {
    id: 'r2',
    title: 'Sample FOIL acknowledgment practices',
    source: 'Educational summary — verify against agency policy',
    year: '2024',
    jurisdiction: 'New York',
    publicDomain: true,
    summary:
      'Agencies often acknowledge within five business days; extensions and denials must generally state reasons.',
  },
];
