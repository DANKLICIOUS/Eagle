import type { SkillPack } from '../types';
import { CONSENT_VERSION, DRAFT_BANNER } from '../guardrails';
import { DISCLAIMER_ONCE, INTERVIEW_FIELDS, INTERVIEWER_VOICE } from '../foil-pro';

const fieldList = INTERVIEW_FIELDS.map((f, i) => `${i + 1}. ${f.label}`).join('\n');

/** Interview-first FOIL drafter. Process facts: skill references/ny-foil-process.md */
export const foilInterviewPack: SkillPack = {
  id: 'foil-interview',
  version: '1.1.0',
  title: 'FOIL how-to interview',
  description:
    'Ask what you need, then prepare a NY FOIL draft you file yourself. Track dates after you file.',
  source: 'eagle/.grok/skills/foil-interview-tracker',
  jurisdictions: ['US-NY', 'US-NYC'],
  domains: ['foil', 'interview', 'tracker'],
  activation: {
    triggers: [
      'generate a FOIL request',
      'interview me for FOIL',
      'track my FOIL',
      'how do I file a FOIL',
    ],
    matchPatterns: [
      'interview',
      'generate (a )?(foil|FOIL)',
      'how (do|does) (i|you) (foil|file)',
      'track(ing)? (my )?(foil|request)',
      'follow[- ]up',
    ],
    modules: ['engine', 'foil', 'settings'],
    priority: 95,
  },
  compliance: {
    mode: 'educational_only',
    requiresConsent: true,
    minConsentVersion: CONSENT_VERSION,
    requiredFooter: DISCLAIMER_ONCE,
    doesNot: [
      'File or submit FOIL requests',
      'Promise that the agency produces records',
      'Invent FOIL numbers or agency statuses',
    ],
    bannedPhrases: [
      'file now',
      'guaranteed',
      'build your defense',
      'you will win',
      'beat',
    ],
  },
  behavior: {
    systemPrompt: INTERVIEWER_VOICE,
    instructions: `Ask one missing field at a time:\n${fieldList}\n
If the records are already public, stop and point to that source.
Month and year is enough for when it happened, even two years later. Expand to that calendar month. Do not invent a day.
MTA OIG records: mta-oig.ts (foil@mtaig.org). OIG does not take FOIL for NYCT/MTA operating records — those stay on https://new.mta.info/transparency/foil.
NYCT fare evasion: number the draft with official subject-matter headings from the MTA list (NYCT: Accidents, injury and tort files; Complaints; Dispatch records; Disciplinary records; Investigations; Passenger traffic records; Photographs; Videos. MTA HQ: POLICE INCIDENT REPORTS, MEMO BOOKS, RADIO RUNS, SUMMONS RECORDS — not station CCTV). Source: https://www.mta.info/transparency/foil/agency-subject-matter-lists
NYPD Public Safety: payroll, medical, criminal-history, and collision-report desks are in nypd-special-records.ts — not the FOIL Unit. Your own rap sheet: IdentoGO service codes in dcjs-chri.ts. The agency CHRI PDF is not for individuals.
Draft with a one-line note (${DISCLAIMER_ONCE}) above the letter, then the letter the agency reads (numbered items, email copies, 5 business days to acknowledge, written reason and appeal path if they deny).
Do not put product pricing in the interview.
If they already filed: you record their FOIL number and dates. You do not invent agency mail.`,
    staticReply: `${DISCLAIMER_ONCE}

You do not need a lawyer to request records. Anyone can FOIL. You file the request yourself.

Before you write: look on NYC OpenData, Government Publications, NYC.gov, 311, CCRB MOS records, the NYCLU database, and Legal Aid LELU. If the records are already there, you generally do not FOIL them again.

Open **FOIL** and answer the questions. Month and year is enough if you do not remember the day — even if it was years ago. I prepare a draft from what you tell me. I do not invent a letter from a blank form.

After you file, the agency generally has 5 business days to acknowledge. If they deny, they must state the reason. You generally have 30 calendar days to appeal. A lawsuit is optional, slow, and costly.`,
  },
  ui: {
    starterPrompts: [
      'Walk me through a NYPD body-worn camera FOIL',
      'I already filed — what dates do I watch?',
    ],
    moduleLinks: ['/foil'],
  },
  sources: [
    'eagle/.grok/skills/foil-interview-tracker/references/ny-foil-process.md',
    'N.Y. Public Officers Law Article 6 [public statute — verify]',
  ],
};
