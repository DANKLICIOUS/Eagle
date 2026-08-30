/** Single home for FOIL Pro commercial + tracker defaults. */

/** Interviewer voice — civic how-to. Import this; do not rewrite it in UI copy. */
export const INTERVIEWER_VOICE = `You are a civic how-to interviewer for New York FOIL, not a salesperson and not a lawyer.

Voice:
- Second person, present tense: “you file,” “the agency has 5 business days,” “you may appeal.”
- Calm and procedural. No hype. No “win,” “beat,” “build your defense,” “File Now.”
- Anyone can FOIL. You do not need a lawyer to request records. A lawsuit is optional, slow, and costly.
- One disclaimer, once, at the start: “This is not a replacement for legal advice.” Do not repeat it every paragraph.
- Verify, don’t promise: “generally,” “must state the reason,” “you have 30 calendar days” — not “they will produce.”
- Ask one missing field at a time. If the records are already public, stop and send the person there instead of drafting.
- Dates: month and year is enough, even if it was years ago. Do not demand a calendar day. Expand “March 2024” to that whole month in the draft and say it is the month they remember.`;

export const DISCLAIMER_ONCE =
  'This is not a replacement for legal advice.';

export const FOIL_PRO = {
  priceUsdPerWeek: 9.99,
  productId: 'eagle_foil_pro_weekly',
  label: '$9.99/week',
  blurb:
    'You prepare drafts, keep dates, and get reminders when a response window may be up. In-app purchase. You file. A lawsuit is optional, slow, and costly.',
  storage: {
    cases: 'eagle.foil.cases.v1',
    timer: 'eagle.foil.timer.v1',
    pro: 'eagle.foil.pro.v1',
  },
  timer: {
    defaultEnabled: false,
    defaultIntervalHours: 24,
    minIntervalHours: 6,
    maxIntervalHours: 168,
  },
} as const;

export const INTERVIEW_FIELDS = [
  {
    id: 'agency',
    label: 'Which agency holds the records? Pick from the NYC FOIL directory if you can.',
    placeholder: 'Start typing — e.g. Police, CCRB, Correction',
  },
  {
    id: 'rao',
    label: 'Do you have a Records Access Officer name, or do you address “Records Access Officer”?',
    placeholder: 'Name, or leave blank',
  },
  {
    id: 'publicCheck',
    label: 'Have you already found these records on OpenData, Publications, 311, MOS histories, NYCLU, or LELU?',
    placeholder: 'Yes — where? / Not yet',
  },
  {
    id: 'recordTypes',
    label: 'What existing records are you asking for?',
    placeholder: 'Body-worn camera, memo book, CAD, policy, contract, disciplinary file…',
  },
  {
    id: 'when',
    label: 'When did this happen? Month and year is enough — even if it was years ago. You do not need the exact day.',
    placeholder: 'e.g. March 2024',
  },
  {
    id: 'whereWho',
    label: 'What place, precinct, badge, or report number do you remember? Skip any you do not know.',
    placeholder: 'Precinct, street, badge, complaint or incident number — or leave blank',
  },
  {
    id: 'delivery',
    label: 'How do you want the copies? Email is typical.',
    placeholder: 'Email',
  },
  {
    id: 'contactName',
    label: 'What name should the agency use for you?',
    placeholder: 'Your name',
  },
  {
    id: 'contactEmail',
    label: 'What email should they use if they need to clarify?',
    placeholder: 'you@example.com',
  },
  {
    id: 'contactPhone',
    label: 'What phone number can they use? Optional.',
    placeholder: 'Optional',
  },
  {
    id: 'alreadyFiled',
    label: 'Have you already filed? If yes, what FOIL number and date?',
    placeholder: 'No / FOIL number and the date you filed',
  },
] as const;

export type FoilCaseStatus =
  | 'drafted'
  | 'filed'
  | 'acknowledged'
  | 'producing'
  | 'denied'
  | 'constructive_denial'
  | 'appeal_window';

export type FoilCase = {
  id: string;
  createdAt: string;
  agency: string;
  subject: string;
  foilNumber: string;
  filedAt: string;
  status: FoilCaseStatus;
  lastAgencyAt: string;
  nextCheckAt: string;
  lastResearchAt: string;
  lastResearchNote: string;
  draft: string;
};

export type FoilTimer = {
  enabled: boolean;
  intervalHours: number;
};

export function defaultTimer(): FoilTimer {
  return {
    enabled: FOIL_PRO.timer.defaultEnabled,
    intervalHours: FOIL_PRO.timer.defaultIntervalHours,
  };
}

export function addBusinessDays(isoDate: string, days: number): string {
  const d = isoDate ? new Date(isoDate) : new Date();
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) left -= 1;
  }
  return d.toISOString();
}

const MONTH_INDEX: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sept: 8,
  sep: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

function monthName(monthIndex: number): string {
  return new Date(2000, monthIndex, 1).toLocaleString('en-US', { month: 'long' });
}

function lastDateOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export type WhenSpan = {
  display: string;
  precision: 'day' | 'month' | 'year' | 'unknown';
};

/**
 * Month and year is enough. Expand to the calendar month (or year) the person remembers.
 * Do not invent a day they did not give.
 */
export function expandWhen(raw: string): WhenSpan {
  const t = (raw || '').trim();
  if (!t) {
    return {
      display: 'the month and year you remember [FACT NEEDED]',
      precision: 'unknown',
    };
  }

  const isoDay = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoDay) {
    const y = Number(isoDay[1]);
    const m = Number(isoDay[2]) - 1;
    const d = Number(isoDay[3]);
    return {
      display: `${monthName(m)} ${d}, ${y}`,
      precision: 'day',
    };
  }

  const namedDay = t.match(
    /^(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})$/i
  );
  if (namedDay) {
    const m = MONTH_INDEX[namedDay[1].toLowerCase()];
    const d = Number(namedDay[2]);
    const y = Number(namedDay[3]);
    return { display: `${monthName(m)} ${d}, ${y}`, precision: 'day' };
  }

  const namedMonth = t.match(
    /^(?:around\s+|about\s+|in\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{4})$/i
  );
  if (namedMonth) {
    const m = MONTH_INDEX[namedMonth[1].toLowerCase()];
    const y = Number(namedMonth[2]);
    const last = lastDateOfMonth(y, m);
    return {
      display: `${monthName(m)} 1, ${y} through ${monthName(m)} ${last}, ${y} (the calendar month you remember)`,
      precision: 'month',
    };
  }

  const numericMonth = t.match(/^(?:around\s+|about\s+|in\s+)?(\d{1,2})[/-](\d{4})$/);
  if (numericMonth) {
    const m = Number(numericMonth[1]) - 1;
    const y = Number(numericMonth[2]);
    if (m >= 0 && m <= 11) {
      const last = lastDateOfMonth(y, m);
      return {
        display: `${monthName(m)} 1, ${y} through ${monthName(m)} ${last}, ${y} (the calendar month you remember)`,
        precision: 'month',
      };
    }
  }

  const isoMonth = t.match(/^(\d{4})-(\d{1,2})$/);
  if (isoMonth) {
    const y = Number(isoMonth[1]);
    const m = Number(isoMonth[2]) - 1;
    if (m >= 0 && m <= 11) {
      const last = lastDateOfMonth(y, m);
      return {
        display: `${monthName(m)} 1, ${y} through ${monthName(m)} ${last}, ${y} (the calendar month you remember)`,
        precision: 'month',
      };
    }
  }

  const yearOnly = t.match(/^(?:around\s+|about\s+|in\s+)?(\d{4})$/);
  if (yearOnly) {
    const y = Number(yearOnly[1]);
    return {
      display: `January 1, ${y} through December 31, ${y} (the year you remember)`,
      precision: 'year',
    };
  }

  return {
    display: `${t} (as you remember it — month and year is enough if you do not have a day)`,
    precision: 'unknown',
  };
}
