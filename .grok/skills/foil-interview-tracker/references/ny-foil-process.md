# NY FOIL process (single source of truth)

Verify against current N.Y. Public Officers Law Article 6 and the agency’s own FOIL page before using any deadline or exemption.

## NYCT / MTA (not City OpenRecords)

New York City Transit is MTA. You do not file NYCT records with a City FOIL officer.

- Portal (preferred): https://new.mta.info/transparency/foil — one filing; MTA processes NYCT.
- Mail: FOIL Team, MTA Legal Department, 2 Broadway, 4th Floor, New York, NY 10004
- Email in public use: foil@mtahq.org — verify on the MTA FOIL page before you send.

Subject-matter lists (verify): https://www.mta.info/transparency/foil/agency-subject-matter-lists (page dated Nov 20, 2024).

For one fare evasion on NYCT, you describe existing records under these published headings:

NYCT list: Accidents, injury and tort files; Complaints; Dispatch records; Disciplinary records (existing staff files only — they may be withheld in part); Investigations; Passenger traffic records; Photographs; Videos.

MTA Headquarters list (often MTA PD — not the same pile as station CCTV): POLICE INCIDENT REPORTS; POLICE MEMO BOOKS; POLICE RADIO RUNS; POLICE SUMMONS RECORDS.

Month and year is enough. If NYPD also issued a summons, that is a **second** request to NYPD.

## City OpenRecords form (not MTA)

Most City agencies: https://a860-openrecords.nyc.gov/request/new

You fill:

| Field | What you put |
|-------|----------------|
| Category | Groups agencies (e.g. Public Safety for NYPD / CCRB). Pick the category that lists your agency. |
| Agency | The agency that holds the records. |
| Request Title (90 characters, **public**) | Short summary. No names, emails, badge numbers, or home addresses. Example on the form: “Queens Blvd Roadwork Permit.” |
| Request Description (**not public**) | Type of records and approximate date range. Month and year is enough. |

After you submit, you receive a confirmation number so you can track the request. The agency notifies you about how much time it needs. If the wrong agency is chosen, they generally tell you within five days to resubmit.

NYCT / MTA operating records are **not** this form. MTA Inspector General records are also **not** this form — use `mta-oig.ts`.

## NYPD desks that are not the FOIL Unit

When Category is Public Safety and Agency is New York City Police Department, the form lists payroll, medical, criminal-history, and collision-report desks that are **not** the FOIL Unit. Use `packages/skill-packs/src/nypd-special-records.ts`. Your own criminal history is IdentoGO (`dcjs-chri.ts`), not the agency CHRI access PDF. Jaywalking, summons, body-worn camera, and precinct reports stay on OpenRecords.

## Where you send it (NYC)

Records Access and Appeals officers live in `packages/skill-packs/src/data/nyc-foil-officers.json` (111 City entities). You look up the agency, then you email the Records Access Officer. You email a different Appeals Officer if you appeal. Verify the address on the agency site before you send — people and inboxes change.

## Check before FOIL

Do not draft a request until the interview has asked whether the record is already public.

- NYC Government Publications: https://www.nyc.gov/site/dcas/agencies/government-publications.page
- NYC OpenData: https://opendata.cityofnewyork.us/
- NYC.gov: https://www.nyc.gov/
- NYC 311: https://portal.311.nyc.gov/
- NYC FOIL portal (file/track most City agencies): search “NYC FOIL”
- NYPD MOS histories (CCRB): https://www.nyc.gov/site/ccrb/policy/MOS-records.page
- NYCLU NYPD misconduct database: https://www.nyclu.org/en/campaigns/nypd-misconduct-database
- Legal Aid LELU: https://legalaidnyc.org/law-enforcement-look-up/

## What FOIL covers

All government records are presumptively available unless an exemption in POL § 87(2) applies. “Records” includes paper, electronic files, data, audio, and video. Agencies must locate, review, and produce **existing** records; they need not create new ones.

Volume, burden, or employee embarrassment is not a valid denial reason.

## Common § 87(2) exemptions (names only — cite the statute, do not invent holdings)

- Another state/federal confidentiality statute
- Unwarranted invasion of personal privacy (does not bar records about the requester; identifiers may be deleted)
- Certain law-enforcement records (active investigation, confidential source, non-routine technique)
- Inter-/intra-agency materials (facts, staff instructions affecting the public, and final policy often still produce)

## Letter skeleton

1. Date; Records Access Officer name/address (or “Records Access Officer”)
2. Subject: `Re: FOIL Request – [record type] from [agency]`
3. First sentence: who you are; request pursuant to NY FOIL (POL Article 6); brief description
4. Numbered, reasonably specific items. **Month and year is enough** (expand “March 2024” to that calendar month; do not invent a day). Add precinct, location, badge, or report number only if they remember.
5. Production Date language through the date the agency completes production
6. Prefer email copies; ask cost if remainder cannot be emailed (toolkit cites FOIL § 89(5)(a) — **verify**)
7. Ask the agency to say if the description is not reasonable
8. Ask for 5 **business** day acknowledgment and a written reason + appeal path for any denial
9. Requester email and phone

Eagle **never** files, emails, or portals the request.

## After the user says they filed

- 5 business days from electronic receipt → ack, produce, or deny
- Silence after the statutory window → constructive denial → administrative appeal
- Denial/redaction/incomplete search → administrative appeal generally within **30 calendar days** of the denial/production
- Appeal goes to a **different** Records Access Appeals Officer; attach exhibits (request = A, ack = B, …)
- Lawsuit is optional, expensive, and not legal advice; skill stops at educational appeal draft + tracker dates

## Monitoring (product)

Track user-entered: filed date, FOIL number, last agency letter, next statutory-ish check date. Never invent an agency status. Research ticks run `research-start` (leads, not authorities) — not case strategy.
