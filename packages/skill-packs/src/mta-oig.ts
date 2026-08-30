/**
 * MTA Inspector General FOIL — OIG records only, not NYCT/MTA operating records.
 * Copy as posted by the Office of the MTA Inspector General. Verify before you send.
 */

export const MTA_OIG_FOIL_URL = 'https://new.mta.info/transparency/foil';

export const MTA_OIG = {
  entity: 'Office of the MTA Inspector General',
  law: 'New York Public Officers Law Article 6 (FOIL)',
  rao: {
    title: 'Records Access Officer',
    office: 'Office of the MTA Inspector General',
    addressLines: [
      'One Penn Plaza, 11th Floor, Suite 1110',
      'New York, NY 10119',
    ],
    phone: '(212) 878-0000',
    fax: '(212) 878-0003',
    email: 'foil@mtaig.org',
  },
  appeals: {
    title: 'Records Access Appeals Officer',
    office: 'Office of the MTA Inspector General',
    addressLines: [
      'One Penn Plaza, 11th Floor, Suite 1110',
      'New York, NY 10119',
    ],
    fax: '(212) 878-0003',
    email: 'foilappeals@mtaig.org',
    windowDays: 30,
  },
  copyFee: {
    perPageCents: 25,
    maxPageInches: '8.5 x 14',
    statute: 'Public Officers Law § 87(1)(b)(iii)',
    note: 'As posted. The fee is subject to change.',
  },
  notFor:
    'The MTA OIG does not handle FOIL requests seeking records of the MTA and its constituent agencies. Those go to https://new.mta.info/transparency/foil.',
  howYouAsk:
    'You send a written request with your name and address, other contact if useful, and a detailed description of existing records. You may say whether you want to inspect or receive copies. If you do not say, the office treats it as a request for copies. You may deliver it in person, by mail, fax, or email.',
} as const;

export function isMtaOigMatter(query: string): boolean {
  return /\boig\b|inspector\s+general|\bmtaig\b/i.test(query || '');
}
