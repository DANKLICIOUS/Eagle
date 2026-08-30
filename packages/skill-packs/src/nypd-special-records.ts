/**
 * NYPD OpenRecords (Public Safety) desks that are not the FOIL Unit.
 * Copy as posted on the NYPD request form. Verify before you send.
 */

export const NYPD_ENTITY = 'New York City Police Department';
export const NYPD_OPENRECORDS_CATEGORY = 'Public Safety';

/** Collision reports: NYPD portal after this date; NYSDMV before. */
export const NYPD_COLLISION_PORTAL_START = '2016-09-30';

export type NypdSpecialChannelId =
  | 'payroll_employment'
  | 'medical'
  | 'criminal_history'
  | 'collision';

export type NypdSpecialChannel = {
  id: NypdSpecialChannelId;
  label: string;
  match: RegExp;
  howYouGet: string;
  lines: string[];
  urls?: string[];
};

export const NYPD_SPECIAL_CHANNELS: NypdSpecialChannel[] = [
  {
    id: 'payroll_employment',
    label: 'Payroll / employment records',
    match: /\bpayroll\b|\bemployment records?\b|\bw-?2\b|\bpaycheck/i,
    howYouGet: 'You send this to Payroll & Benefits, not the FOIL Unit and not OpenRecords.',
    lines: [
      'Director Payroll & Benefits Division',
      '90 Church Street, 12th Floor',
      'New York, NY 10007',
    ],
  },
  {
    id: 'medical',
    label: 'Medical records',
    match: /\bmedical (records?|division|file)\b|\bsick[- ]leave\b/i,
    howYouGet: 'You send this to the Medical Division, not the FOIL Unit and not OpenRecords.',
    lines: [
      'Medical Division',
      '1 Lefrak City Plaza, 16th Floor',
      '59-17 Junction Blvd.',
      'Corona, NY 11368',
    ],
  },
  {
    id: 'criminal_history',
    label: 'Criminal history / background checks',
    match: /\bcriminal history\b|\bbackground check\b|\brap sheet\b|\bnysid\b/i,
    howYouGet:
      'You request this from NYS Division of Criminal Justice Services, not NYPD OpenRecords.',
    lines: [
      'New York State Division of Criminal Justice Services',
      '80 S Swan Street',
      'Albany, NY 12210',
    ],
    urls: [
      'https://criminaljustice.ny.gov/request-your-new-york-state-criminal-history',
      'https://uenroll.identogo.com/',
    ],
  },
  {
    id: 'collision',
    label: 'Collision reports',
    match: /\bcollision reports?\b|\baccident reports?\b|\bmv-?104\b|\bcrash reports?\b/i,
    howYouGet:
      'Collision reports taken by NYPD are not the OpenRecords FOIL box. The date of the report picks the desk.',
    lines: [
      `Before ${formatCutoff()}: New York State DMV (http://dmv.ny.gov/get-accident-report). Mail: NYSDMV, MV-198 C Processing, 6 Empire State Plaza, Albany, NY 12228.`,
      `After ${formatCutoff()}: NYPD Collision Report website (https://collisionreport.nypdonline.org/).`,
    ],
    urls: [
      'http://dmv.ny.gov/get-accident-report',
      'https://collisionreport.nypdonline.org/',
    ],
  },
];

function formatCutoff(): string {
  return 'September 30, 2016';
}

export function isNypdAgency(entity: string): boolean {
  return /new york city police department|\bnypd\b/i.test(entity || '');
}

export function matchNypdSpecialChannel(recordTypes: string): NypdSpecialChannel | undefined {
  const t = (recordTypes || '').trim();
  if (!t) return undefined;
  return NYPD_SPECIAL_CHANNELS.find((c) => c.match.test(t));
}

/** If the user gave a year or date, pick DMV vs NYPD collision portal. */
export function collisionDeskForWhen(whenRaw: string): {
  desk: 'dmv' | 'nypd_portal' | 'ask';
  line: string;
} {
  const t = (whenRaw || '').trim();
  const y = t.match(/\b((?:19|20)\d{2})\b/);
  const year = y ? Number(y[1]) : NaN;
  if (!Number.isFinite(year)) {
    return {
      desk: 'ask',
      line: `Month and year is enough. Reports taken before ${formatCutoff()} go to NYSDMV. Reports taken after that date go to https://collisionreport.nypdonline.org/.`,
    };
  }
  if (year < 2016) {
    return {
      desk: 'dmv',
      line: `That year is before ${formatCutoff()}. You request the collision report from NYSDMV: http://dmv.ny.gov/get-accident-report or mail NYSDMV, MV-198 C Processing, 6 Empire State Plaza, Albany, NY 12228.`,
    };
  }
  if (year > 2016) {
    return {
      desk: 'nypd_portal',
      line: `That year is after ${formatCutoff()}. You use the NYPD Collision Report website: https://collisionreport.nypdonline.org/.`,
    };
  }
  const beforeSep = /jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?/i.test(
    t
  );
  const afterSep = /oct(?:ober)?|nov(?:ember)?|dec(?:ember)?/i.test(t);
  if (beforeSep) {
    return {
      desk: 'dmv',
      line: `That month in 2016 is before ${formatCutoff()}. You request the collision report from NYSDMV: http://dmv.ny.gov/get-accident-report or mail NYSDMV, MV-198 C Processing, 6 Empire State Plaza, Albany, NY 12228.`,
    };
  }
  if (afterSep) {
    return {
      desk: 'nypd_portal',
      line: `That month in 2016 is after ${formatCutoff()}. You use the NYPD Collision Report website: https://collisionreport.nypdonline.org/.`,
    };
  }
  return {
    desk: 'ask',
    line: `2016 splits at ${formatCutoff()}. If the report is before that date, you use NYSDMV. If after, you use https://collisionreport.nypdonline.org/.`,
  };
}

export function nypdSpecialHowTo(channel: NypdSpecialChannel, whenRaw?: string): string {
  const collision =
    channel.id === 'collision' ? collisionDeskForWhen(whenRaw || '') : null;
  return [
    channel.howYouGet,
    collision?.line,
    ...channel.lines,
    ...(channel.urls || []),
  ]
    .filter(Boolean)
    .join('\n');
}
