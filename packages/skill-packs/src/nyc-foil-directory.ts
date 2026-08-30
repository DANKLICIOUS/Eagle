import directory from './data/nyc-foil-officers.json';
import { MTA_OIG } from './mta-oig';

export type FoilOfficer = {
  first: string;
  last: string;
  title: string;
  email: string;
};

export type FoilAgency = {
  entity: string;
  access: FoilOfficer | null;
  appeals: FoilOfficer | null;
  note?: string;
  portal?: string;
  mail?: string;
  fax?: string;
  phone?: string;
};

export const NYC_FOIL_DIRECTORY_SOURCE = directory.source;

/** MTA / NYCT is not a City OpenRecords agency. One home for that filing path. */
export const MTA_NYCT_AGENCY: FoilAgency = {
  entity: 'MTA New York City Transit (NYCT)',
  access: {
    first: 'FOIL',
    last: 'Team',
    title: 'MTA Legal Department — records for NYCT, buses, and subway',
    email: 'foil@mtahq.org',
  },
  appeals: {
    first: 'FOIL',
    last: 'Appeals Officer',
    title: 'MTA Legal Department',
    email: 'foil@mtahq.org',
  },
  portal: 'https://new.mta.info/transparency/foil',
  mail: 'FOIL Team, MTA Legal Department, 2 Broadway, 4th Floor, New York, NY 10004',
  note: 'NYCT is MTA, not a City agency. You file once with the MTA FOIL team (portal is preferred). They process NYCT. Subject-matter lists: https://www.mta.info/transparency/foil/agency-subject-matter-lists. If NYPD also wrote a fare-evasion summons, that is a second request to NYPD. OIG records are a different desk — Office of the MTA Inspector General.',
};

export const MTA_OIG_AGENCY: FoilAgency = {
  entity: MTA_OIG.entity,
  access: {
    first: 'Records',
    last: 'Access Officer',
    title: MTA_OIG.rao.title,
    email: MTA_OIG.rao.email,
  },
  appeals: {
    first: 'Records',
    last: 'Access Appeals Officer',
    title: MTA_OIG.appeals.title,
    email: MTA_OIG.appeals.email,
  },
  mail: `${MTA_OIG.rao.office}, ${MTA_OIG.rao.addressLines.join(', ')}`,
  fax: MTA_OIG.rao.fax,
  phone: MTA_OIG.rao.phone,
  note: MTA_OIG.notFor,
};

export const NYC_FOIL_AGENCIES: FoilAgency[] = [
  MTA_OIG_AGENCY,
  MTA_NYCT_AGENCY,
  ...(directory.agencies as FoilAgency[]),
];

const ALIASES: Record<string, string> = {
  nypd: 'New York City Police Department',
  police: 'New York City Police Department',
  ccrb: 'Civilian Complaint Review Board',
  acs: "Administration for Children's Services",
  doc: 'Department of Correction',
  doe: 'Department of Education',
  fdny: 'New York City Fire Department',
  fire: 'New York City Fire Department',
  dep: 'Department of Environmental Protection',
  dcas: 'Department of Citywide Administrative Services',
  hpd: 'Department of Housing Preservation and Development',
  dof: 'Department of Finance',
  dot: 'Department of Transportation',
  dsny: 'Department of Sanitation',
  tlc: 'Taxi and Limousine Commission',
  doi: 'Department of Investigation',
  hra: 'Human Resources Administration',
  dhs: 'Human Resources Administration',
  parks: 'Department of Parks & Recreation',
  nyct: 'MTA New York City Transit (NYCT)',
  transit: 'MTA New York City Transit (NYCT)',
  mta: 'MTA New York City Transit (NYCT)',
  subway: 'MTA New York City Transit (NYCT)',
  'new york city transit': 'MTA New York City Transit (NYCT)',
  oig: MTA_OIG.entity,
  mtaig: MTA_OIG.entity,
  'inspector general': MTA_OIG.entity,
  'mta inspector general': MTA_OIG.entity,
  'mta oig': MTA_OIG.entity,
};

export function officerLine(o: FoilOfficer | null): string {
  if (!o) return '';
  const name = `${o.first} ${o.last}`.trim();
  const title = o.title ? `, ${o.title}` : '';
  return `${name}${title} <${o.email}>`;
}

export function findFoilAgency(query: string): FoilAgency | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  if (/\boig\b/.test(q) || /inspector\s+general/.test(q) || /\bmtaig\b/.test(q)) {
    return MTA_OIG_AGENCY;
  }
  if (/\bnyct\b/.test(q) || /\btransit\b/.test(q) || /\bmta\b/.test(q)) {
    return MTA_NYCT_AGENCY;
  }
  const aliased = ALIASES[q];
  if (aliased) {
    return NYC_FOIL_AGENCIES.find((a) => a.entity === aliased);
  }
  const exact = NYC_FOIL_AGENCIES.find((a) => a.entity.toLowerCase() === q);
  if (exact) return exact;
  return NYC_FOIL_AGENCIES.find((a) => a.entity.toLowerCase().includes(q));
}

export function isFareEvasionMatter(recordTypes: string): boolean {
  return /fare\s*evas|turnstile|omny|metrocard|\btap\b/i.test(recordTypes);
}
