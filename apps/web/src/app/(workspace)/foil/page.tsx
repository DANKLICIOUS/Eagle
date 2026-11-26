'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { StageHeader } from '@/components/StageHeader';
import {
  DISCLAIMER_ONCE,
  INTERVIEW_FIELDS,
  MTA_SUBJECT_LIST_URL,
  NYC_FOIL_AGENCIES,
  NYCT_FARE_EVASION_HEADINGS,
  DCJS_CHRI_ACCESS,
  DCJS_CHRI_EMPTY,
  DCJS_RECORD_REVIEW_FEE,
  DCJS_RECORD_REVIEW_URL,
  DCJS_SERVICE_CODES,
  IDENTOGO_PHONE,
  IDENTOGO_URL,
  MTA_OIG,
  MTA_OIG_FOIL_URL,
  NYPD_SPECIAL_CHANNELS,
  OPENRECORDS_URL,
  isMtaOigMatter,
  buildOpenRecordsFields,
  collisionDeskForWhen,
  dcjsMailto,
  expandWhen,
  fareEvasionHeadingLines,
  findFoilAgency,
  isCriminalHistoryMatter,
  isFareEvasionMatter,
  isNypdAgency,
  matchNypdSpecialChannel,
  nypdSpecialHowTo,
  officerLine,
  type DcjsChriAnswers,
  type DcjsChriPurpose,
  type DcjsChriScope,
} from '@plate/skill-packs';
import { downloadBytes, fillDcjsChriPdf } from '@/lib/fill-dcjs-chri';
import {
  STATUS_LABEL,
  loadCases,
  loadProUnlocked,
  loadTimer,
  newCase,
  saveCases,
  tickResearch,
  type FoilCase,
} from '@/lib/foil-tracker';
import { ClipboardList, Scale, Timer } from 'lucide-react';
import Link from 'next/link';

type Answers = Record<string, string>;

function buildDraft(a: Answers): string {
  const items = (a.recordTypes || '[FACT NEEDED: record types]')
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const when = expandWhen(a.when || '');
  const extra = [a.whereWho?.trim()].filter(Boolean).join('; ');
  const agencyRow = findFoilAgency(a.agency || '');
  const access = agencyRow?.access;
  const raoName = a.rao?.trim() || (access ? `${access.first} ${access.last}`.trim() : 'Records Access Officer');
  const raoEmail = a.raoEmail?.trim() || access?.email || '';
  const nypdSpecial =
    isNypdAgency(agencyRow?.entity || a.agency || '')
      ? matchNypdSpecialChannel(a.recordTypes || '')
      : undefined;
  if (nypdSpecial) {
    return `— For you (not a FOIL letter) —
${DISCLAIMER_ONCE} You do not use NYC OpenRecords for this piece.

${nypdSpecialHowTo(nypdSpecial, a.when)}
`;
  }

  const nyctFare =
    Boolean(agencyRow?.entity.includes('NYCT')) || isFareEvasionMatter(a.recordTypes || '');
  const numbered = nyctFare
    ? fareEvasionHeadingLines(when.display, extra).join('\n')
    : items
        .map((item, i) => {
          const bits = [when.display, extra].filter(Boolean).join('; ');
          return `  ${i + 1}. ${item}${bits ? ` — ${bits}` : ''}`;
        })
        .join('\n');

  const oig = isMtaOigMatter(agencyRow?.entity || a.agency || '');
  const howYouFile = oig
    ? `You file this yourself in writing to the MTA Inspector General Records Access Officer (${MTA_OIG.rao.email}). Include your name and address. ${MTA_OIG.notFor}`
    : agencyRow?.portal
    ? `You file this yourself. For NYCT/MTA operating records, the portal is preferred: ${agencyRow.portal}. Mail: ${agencyRow.mail || ''}. Verify before you send.`
    : 'You file this yourself. You email the Records Access Officer. Verify the address on the agency site before you send.';

  return `— For you (not part of the letter you send) —
${DISCLAIMER_ONCE} ${howYouFile}

${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${raoName}${access?.title ? `\n${access.title}` : ''}
${agencyRow?.entity || a.agency || '[FACT NEEDED: agency]'}
${raoEmail ? raoEmail : '[FACT NEEDED: Records Access Officer email]'}

Re: FOIL Request – ${a.recordTypes || '[record type]'} from ${a.agency || '[agency]'}

I am ${a.contactName || '[FACT NEEDED: name]'}. Pursuant to the New York Freedom of Information Law (Public Officers Law Article 6), I request copies of the following existing records:

${numbered || '  1. [FACT NEEDED: reasonably describe the records]'}

This request covers existing records for ${when.display}. I do not have a more precise calendar day. Please treat that span as the period I remember.
${
  nyctFare
    ? `\nI describe the records using headings on the MTA FOIL subject-matter lists (${MTA_SUBJECT_LIST_URL}). NYCT headings and MTA Headquarters police headings are different piles: station Photographs/Videos are NYCT; POLICE INCIDENT REPORTS, POLICE MEMO BOOKS, POLICE RADIO RUNS, and POLICE SUMMONS RECORDS are listed under MTA Headquarters.`
    : ''
}

Please provide these records via ${a.delivery || 'email'}${
    oig && a.contactAddress ? `. My mailing address is ${a.contactAddress}` : ''
  }. If all requested records cannot be emailed, please email the portions that can be emailed and state the cost to reproduce the remainder.${
    oig
      ? `\n\nIf copies are produced on paper no larger than ${MTA_OIG.copyFee.maxPageInches}, Public Officers Law § 87(1)(b)(iii) generally allows a copying fee (${MTA_OIG.copyFee.perPageCents} cents per page as posted; verify). If you deny access, I may appeal in writing within ${MTA_OIG.appeals.windowDays} days to ${MTA_OIG.appeals.email}.`
      : ''
  }

If this request does not reasonably describe the records, please email me and I will clarify.

If records are unavailable within five business days of receipt, please describe the records and a date by which access will be provided. If you deny any portion, state the reasons in writing, the appeal procedures, and the name and address of the appeals officer. Delete only material claimed exempt under Public Officers Law § 87(2) [verify] and produce the remainder.

Sincerely,
${a.contactName || '[name]'}
${a.contactEmail || '[email]'}
${a.contactPhone || ''}
`;
}

export default function FoilPage() {
  const [tab, setTab] = useState<'interview' | 'tracker'>('interview');
  const [answers, setAnswers] = useState<Answers>({ delivery: 'Email' });
  const [draft, setDraft] = useState('');
  const [cases, setCases] = useState<FoilCase[]>([]);
  const [pro, setPro] = useState(false);

  useEffect(() => {
    const loaded = loadCases();
    const unlocked = loadProUnlocked();
    const timer = loadTimer();
    setPro(unlocked);
    if (unlocked && timer.enabled) {
      const ms = timer.intervalHours * 3600 * 1000;
      const ticked = loaded.map((c) => {
        const last = c.lastResearchAt ? Date.parse(c.lastResearchAt) : 0;
        return Date.now() - last >= ms ? tickResearch(c) : c;
      });
      saveCases(ticked);
      setCases(ticked);
    } else {
      setCases(loaded);
    }
  }, []);

  const agencyMatch = useMemo(() => findFoilAgency(answers.agency || ''), [answers.agency]);
  const nypd = isNypdAgency(agencyMatch?.entity || answers.agency || '');
  const nypdSpecial = useMemo(
    () => (nypd ? matchNypdSpecialChannel(answers.recordTypes || '') : undefined),
    [nypd, answers.recordTypes]
  );
  const collisionHint = nypdSpecial?.id === 'collision' ? collisionDeskForWhen(answers.when || '') : null;
  const criminalHistory =
    nypdSpecial?.id === 'criminal_history' ||
    isCriminalHistoryMatter(answers.recordTypes || '', answers.agency || '');
  const [dcjs, setDcjs] = useState<DcjsChriAnswers>({
    ...DCJS_CHRI_EMPTY,
  });
  const [dcjsBusy, setDcjsBusy] = useState(false);
  const [dcjsError, setDcjsError] = useState('');
  const [dcjsFilled, setDcjsFilled] = useState(false);

  useEffect(() => {
    setDcjs((d) => ({
      ...d,
      contactName: d.contactName || answers.contactName || '',
      email: d.email || answers.contactEmail || '',
      contactPhone: d.contactPhone || answers.contactPhone || '',
      cityState: d.cityState || (/manhattan/i.test(answers.whereWho || '') ? 'New York, NY' : d.cityState),
    }));
  }, [answers.contactName, answers.contactEmail, answers.contactPhone, answers.whereWho]);

  const portalFields = useMemo(() => {
    const when = expandWhen(answers.when || '');
    const extra = answers.whereWho?.trim() || '';
    const nyct =
      Boolean(agencyMatch?.entity.includes('NYCT')) || isFareEvasionMatter(answers.recordTypes || '');
    const numbered = nyct
      ? fareEvasionHeadingLines(when.display, extra).join('\n')
      : (answers.recordTypes || '')
          .split(/[,;\n]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((item, i) => `  ${i + 1}. ${item}${when.display ? ` — ${when.display}` : ''}`)
          .join('\n');
    return buildOpenRecordsFields({
      agencyEntity: agencyMatch?.entity || answers.agency || '',
      recordTypes: answers.recordTypes,
      when: answers.when,
      whenDisplay: when.display,
      place: extra,
      numberedItems: numbered,
    });
  }, [answers, agencyMatch]);

  const missing = useMemo(
    () => INTERVIEW_FIELDS.filter((f) => ['agency', 'recordTypes', 'contactName'].includes(f.id) && !answers[f.id]?.trim()),
    [answers]
  );

  function onAgencyChange(value: string) {
    const hit = findFoilAgency(value);
    setAnswers((a) => ({
      ...a,
      agency: value,
      rao: hit?.access ? `${hit.access.first} ${hit.access.last}`.trim() : a.rao,
      raoEmail: hit?.access?.email || a.raoEmail,
    }));
  }

  function onInterview(e: FormEvent) {
    e.preventDefault();
    const text = buildDraft(answers);
    setDraft(text);
    const next = [
      newCase({
        agency: answers.agency || 'Unknown agency',
        subject: answers.recordTypes || '',
        draft: text,
        foilNumber: answers.alreadyFiled?.match(/[A-Z0-9-]+/i)?.[0] || '',
        filedAt: /filed|yes/i.test(answers.alreadyFiled || '') ? new Date().toISOString() : '',
        status: /filed|yes/i.test(answers.alreadyFiled || '') ? 'filed' : 'drafted',
      }),
      ...cases,
    ];
    setCases(next);
    saveCases(next);
    setTab('tracker');
  }

  function updateCase(id: string, patch: Partial<FoilCase>) {
    const next = cases.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setCases(next);
    saveCases(next);
  }

  function runTick(id: string) {
    const next = cases.map((c) => (c.id === id ? tickResearch(c) : c));
    setCases(next);
    saveCases(next);
  }

  return (
    <div className="stack gap-lg">
      <StageHeader
        eyebrow="FOIL"
        title="You request records"
        subtitle="Anyone can FOIL. You do not need a lawyer to request records. You file. A lawsuit is optional, slow, and costly."
        actions={
          <div className="row-wrap">
            <button
              type="button"
              className={tab === 'interview' ? 'btn btn-primary' : 'btn'}
              onClick={() => setTab('interview')}
            >
              <Scale size={14} /> Questions
            </button>
            <button
              type="button"
              className={tab === 'tracker' ? 'btn btn-primary' : 'btn'}
              onClick={() => setTab('tracker')}
            >
              <ClipboardList size={14} /> After you file
            </button>
            <Link href="/settings" className="btn btn-ghost">
              Reminders
            </Link>
          </div>
        }
      />



      {tab === 'interview' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          <form className="panel" onSubmit={onInterview}>
            <div className="panel-header">
              <span className="mono" style={{ fontSize: '0.8rem' }}>
                BEFORE YOU WRITE
              </span>
            </div>
            <div className="panel-body stack">
              <p className="muted" style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.55 }}>
                {DISCLAIMER_ONCE} Look first on OpenData, Publications, 311, MOS histories, NYCLU,
                and LELU. If the records are already public, you generally do not need to FOIL.
              </p>
              {INTERVIEW_FIELDS.map((f) => (
                <label key={f.id} className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>
                    {f.label.toUpperCase()}
                  </span>
                  {f.id === 'agency' ? (
                    <>
                      <input
                        className="input"
                        list="nyc-foil-agencies"
                        value={answers.agency || ''}
                        placeholder={f.placeholder}
                        onChange={(e) => onAgencyChange(e.target.value)}
                      />
                      <datalist id="nyc-foil-agencies">
                        {NYC_FOIL_AGENCIES.map((ag) => (
                          <option key={ag.entity} value={ag.entity} />
                        ))}
                      </datalist>
                    </>
                  ) : (
                    <input
                      className="input"
                      value={answers[f.id] || ''}
                      placeholder={f.placeholder}
                      onChange={(e) => setAnswers((a) => ({ ...a, [f.id]: e.target.value }))}
                    />
                  )}
                </label>
              ))}
              {agencyMatch?.access ? (
                <p className="muted" style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {agencyMatch.note ? `${agencyMatch.note} ` : ''}
                  You send this to {officerLine(agencyMatch.access)}
                  {agencyMatch.portal ? (
                    <>
                      . Preferred: {agencyMatch.portal}
                    </>
                  ) : null}
                  . If they deny, you may appeal to{' '}
                  {officerLine(agencyMatch.appeals) || 'the Appeals Officer listed for that agency'}
                  {agencyMatch.fax ? `. Fax ${agencyMatch.fax}` : ''}
                  {agencyMatch.phone ? `. Phone ${agencyMatch.phone}` : ''}.
                  Verify before you send.
                </p>
              ) : answers.agency ? (
                <p className="dim" style={{ margin: 0, fontSize: '0.85rem' }}>
                  That name is not in the City directory yet. You can still write the letter; look up
                  the Records Access Officer on the agency site before you send.
                </p>
              ) : null}
              {nypd ? (
                <div className="muted" style={{ fontSize: '0.88rem', lineHeight: 1.55 }}>
                  <p style={{ margin: '0 0 8px' }}>
                    NYPD OpenRecords (Category: Public Safety) is the FOIL Unit. These desks on that
                    form are not OpenRecords — verify before you send.
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {NYPD_SPECIAL_CHANNELS.map((ch) => (
                      <li
                        key={ch.id}
                        style={
                          nypdSpecial?.id === ch.id
                            ? { fontWeight: 600, color: 'var(--text)' }
                            : undefined
                        }
                      >
                        {ch.label}
                        {nypdSpecial?.id === ch.id ? ' — this is the desk for what you typed' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {agencyMatch?.entity.includes('NYCT') || isFareEvasionMatter(answers.recordTypes || '') ? (
                <div className="muted" style={{ fontSize: '0.88rem', lineHeight: 1.55 }}>
                  <p style={{ margin: '0 0 8px' }}>
                    For one fare evasion on NYCT, you generally describe records that already sit in
                    headings on the{' '}
                    <a href={MTA_SUBJECT_LIST_URL} target="_blank" rel="noreferrer">
                      MTA subject-matter lists
                    </a>
                    . Month and year is enough. If NYPD also wrote a summons, you file a second
                    request with NYPD.
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {NYCT_FARE_EVASION_HEADINGS.map((h) => (
                      <li key={h.list + h.heading}>
                        {h.heading}
                        {h.note ? ` — ${h.note}` : ` (${h.list})`}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {missing.length ? (
                <p className="dim" style={{ margin: 0, fontSize: '0.8rem' }}>
                  Still needed: {missing.map((m) => m.label).join(', ')}
                </p>
              ) : null}
              <button className="btn btn-primary" type="submit" disabled={missing.length > 0}>
                Prepare your draft
              </button>
            </div>
          </form>

          <div className="panel">
            <div className="panel-header">
              <span className="mono" style={{ fontSize: '0.8rem' }}>
                YOUR DRAFT — YOU FILE
              </span>
            </div>
            <div className="panel-body">
              {draft ? (
                <pre
                  className="mono"
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.82rem',
                    lineHeight: 1.55,
                    color: 'var(--text-muted)',
                  }}
                >
                  {draft}
                </pre>
              ) : (
                <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>
                  Answer the questions. The draft asks the agency for copies by email. The agency
                  generally has 5 business days to acknowledge. If they deny, they must state the
                  reason. You generally have 30 calendar days to appeal.
                </p>
              )}
            </div>
          </div>

          {criminalHistory ? (
            <div className="panel" style={{ gridColumn: '1 / -1' }}>
              <div className="panel-header">
                <span className="mono" style={{ fontSize: '0.8rem' }}>
                  DCJS — NOT OPENRECORDS
                </span>
              </div>
              <div className="panel-body stack">
                <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>
                  {DCJS_CHRI_ACCESS.note} You request your own record at IdentoGO. Living in
                  Manhattan instead of Jamaica does not change the service code.
                </p>
                <div className="row-wrap">
                  <span className="badge">In-state: {DCJS_SERVICE_CODES.suppressed.code} suppressed</span>
                  <span className="badge">In-state: {DCJS_SERVICE_CODES.unsuppressed.code} unsuppressed</span>
                  <span className="badge">
                    ${DCJS_RECORD_REVIEW_FEE.inStateUsd.toFixed(2)} to {DCJS_RECORD_REVIEW_FEE.payTo}
                  </span>
                </div>
                <div className="row-wrap">
                  <a className="btn btn-primary" href={IDENTOGO_URL} target="_blank" rel="noreferrer">
                    Open IdentoGO
                  </a>
                  <a className="btn" href={DCJS_RECORD_REVIEW_URL} target="_blank" rel="noreferrer">
                    Record-review steps
                  </a>
                  <a className="btn btn-ghost" href={`tel:${IDENTOGO_PHONE}`}>
                    {IDENTOGO_PHONE}
                  </a>
                </div>
                <p className="dim" style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.55 }}>
                  The PDF you opened is the agency CHRI access form. Fill it only if you are an
                  agency with statutory access. The engine fills it; you attach it and send.
                </p>
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>AGENCY NAME</span>
                  <input className="input" value={dcjs.agencyName} onChange={(e) => setDcjs((d) => ({ ...d, agencyName: e.target.value }))} />
                </label>
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>ADDRESS</span>
                  <input className="input" value={dcjs.address} onChange={(e) => setDcjs((d) => ({ ...d, address: e.target.value }))} />
                </label>
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>CITY AND STATE</span>
                  <input className="input" value={dcjs.cityState} placeholder="New York, NY" onChange={(e) => setDcjs((d) => ({ ...d, cityState: e.target.value }))} />
                </label>
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>CONTACT NAME</span>
                  <input className="input" value={dcjs.contactName} onChange={(e) => setDcjs((d) => ({ ...d, contactName: e.target.value }))} />
                </label>
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>PHONE</span>
                  <input className="input" value={dcjs.contactPhone} onChange={(e) => setDcjs((d) => ({ ...d, contactPhone: e.target.value }))} />
                </label>
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>EMAIL</span>
                  <input className="input" value={dcjs.email} onChange={(e) => setDcjs((d) => ({ ...d, email: e.target.value }))} />
                </label>
                <label className="row gap-sm" style={{ alignItems: 'center' }}>
                  <input type="checkbox" checked={dcjs.hasUDAgreement} onChange={(e) => setDcjs((d) => ({ ...d, hasUDAgreement: e.target.checked }))} />
                  <span className="muted">Agency has a current Use &amp; Dissemination Agreement</span>
                </label>
                {dcjs.hasUDAgreement ? (
                  <label className="stack gap-sm">
                    <span className="dim mono" style={{ fontSize: '0.75rem' }}>ORI #</span>
                    <input className="input" value={dcjs.ori} onChange={(e) => setDcjs((d) => ({ ...d, ori: e.target.value }))} />
                  </label>
                ) : null}
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>PURPOSE</span>
                  <select
                    className="input"
                    value={dcjs.purpose}
                    onChange={(e) => setDcjs((d) => ({ ...d, purpose: e.target.value as DcjsChriPurpose }))}
                  >
                    <option value="">Select</option>
                    <option value="employment">Employment / licensing</option>
                    <option value="law_enforcement">Law enforcement / criminal justice</option>
                    <option value="other">Other (not a personal rap sheet)</option>
                  </select>
                </label>
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>SCOPE</span>
                  <select
                    className="input"
                    value={dcjs.scope}
                    onChange={(e) => setDcjs((d) => ({ ...d, scope: e.target.value as DcjsChriScope }))}
                  >
                    <option value="">Select</option>
                    <option value="nys">NYS CHRI only</option>
                    <option value="nys_fbi">NYS &amp; FBI CHRI</option>
                  </select>
                </label>
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>EXPLAIN (IF OTHER)</span>
                  <textarea className="textarea" rows={3} value={dcjs.explain} onChange={(e) => setDcjs((d) => ({ ...d, explain: e.target.value }))} />
                </label>
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>PURPOSE IN DETAIL — ATTACH THE AUTHORIZING LAW</span>
                  <textarea className="textarea" rows={4} value={dcjs.purposeDetail} onChange={(e) => setDcjs((d) => ({ ...d, purposeDetail: e.target.value }))} />
                </label>
                <div className="row-wrap">
                  <label className="row gap-sm" style={{ alignItems: 'center' }}>
                    <input type="checkbox" checked={dcjs.authFederal} onChange={(e) => setDcjs((d) => ({ ...d, authFederal: e.target.checked }))} />
                    <span className="muted">Federal law</span>
                  </label>
                  <label className="row gap-sm" style={{ alignItems: 'center' }}>
                    <input type="checkbox" checked={dcjs.authState} onChange={(e) => setDcjs((d) => ({ ...d, authState: e.target.checked }))} />
                    <span className="muted">State law</span>
                  </label>
                  <label className="row gap-sm" style={{ alignItems: 'center' }}>
                    <input type="checkbox" checked={dcjs.authLocal} onChange={(e) => setDcjs((d) => ({ ...d, authLocal: e.target.checked }))} />
                    <span className="muted">Local law</span>
                  </label>
                </div>
                {dcjsError ? <p className="dim">{dcjsError}</p> : null}
                {dcjsFilled ? (
                  <p className="muted" style={{ margin: 0 }}>
                    Filled PDF downloaded. Attach it in the mail window, then send.
                  </p>
                ) : null}
                <div className="row-wrap">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={dcjsBusy || !dcjs.agencyName || !dcjs.contactName || !dcjs.email}
                    onClick={async () => {
                      setDcjsError('');
                      setDcjsBusy(true);
                      try {
                        const bytes = await fillDcjsChriPdf(dcjs);
                        downloadBytes(bytes, 'dcjs-chri-access.pdf');
                        setDcjsFilled(true);
                        window.location.href = dcjsMailto(dcjs);
                      } catch (err) {
                        setDcjsError(err instanceof Error ? err.message : 'Could not fill the PDF.');
                      } finally {
                        setDcjsBusy(false);
                      }
                    }}
                  >
                    {dcjsBusy ? 'Filling…' : 'Fill PDF and send'}
                  </button>
                  <a className="btn btn-ghost" href={DCJS_CHRI_ACCESS.formUrl} target="_blank" rel="noreferrer">
                    Blank official PDF
                  </a>
                </div>
              </div>
            </div>
          ) : nypdSpecial ? (
            <div className="panel" style={{ gridColumn: '1 / -1' }}>
              <div className="panel-header">
                <span className="mono" style={{ fontSize: '0.8rem' }}>
                  NOT THE OPENRECORDS FOIL BOX
                </span>
              </div>
              <div className="panel-body stack">
                <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>
                  {nypdSpecial.howYouGet}
                </p>
                {collisionHint ? (
                  <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>
                    {collisionHint.line}
                  </p>
                ) : null}
                <pre
                  className="mono"
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.82rem',
                    lineHeight: 1.55,
                    color: 'var(--text-muted)',
                  }}
                >
                  {nypdSpecial.lines.join('\n')}
                </pre>
                {nypdSpecial.urls?.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">
                    {url}
                  </a>
                ))}
              </div>
            </div>
          ) : isMtaOigMatter(agencyMatch?.entity || answers.agency || '') ? (
            <div className="panel" style={{ gridColumn: '1 / -1' }}>
              <div className="panel-header">
                <span className="mono" style={{ fontSize: '0.8rem' }}>
                  MTA INSPECTOR GENERAL — NOT NYCT, NOT OPENRECORDS
                </span>
              </div>
              <div className="panel-body stack">
                <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>
                  {MTA_OIG.howYouAsk} {MTA_OIG.notFor}
                </p>
                <pre
                  className="mono"
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.82rem',
                    lineHeight: 1.55,
                    color: 'var(--text-muted)',
                  }}
                >
                  {`${MTA_OIG.rao.title}
${MTA_OIG.rao.office}
${MTA_OIG.rao.addressLines.join('\n')}
${MTA_OIG.rao.phone}
Fax ${MTA_OIG.rao.fax}
${MTA_OIG.rao.email}`}
                </pre>
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>
                    YOUR MAILING ADDRESS (OIG ASKS FOR NAME AND ADDRESS)
                  </span>
                  <input
                    className="input"
                    value={answers.contactAddress || ''}
                    placeholder="Street, city, state, ZIP"
                    onChange={(e) => setAnswers((a) => ({ ...a, contactAddress: e.target.value }))}
                  />
                </label>
                <p className="dim" style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.55 }}>
                  Inspection is by appointment with the Records Access Officer on regular business
                  days. If they deny, you appeal in writing within {MTA_OIG.appeals.windowDays} days
                  to {MTA_OIG.appeals.email}. Copying fees follow {MTA_OIG.copyFee.statute} (
                  {MTA_OIG.copyFee.perPageCents} cents per page as posted; {MTA_OIG.copyFee.note.toLowerCase()}
                  ).
                </p>
                <div className="row-wrap">
                  <a className="btn btn-primary" href={`mailto:${MTA_OIG.rao.email}`}>
                    Open mail to OIG
                  </a>
                  <a className="btn" href={MTA_OIG_FOIL_URL} target="_blank" rel="noreferrer">
                    MTA operating-agency FOIL
                  </a>
                </div>
              </div>
            </div>
          ) : agencyMatch?.portal ? (
            <div className="panel" style={{ gridColumn: '1 / -1' }}>
              <div className="panel-header">
                <span className="mono" style={{ fontSize: '0.8rem' }}>
                  NOT THE CITY FORM
                </span>
              </div>
              <div className="panel-body">
                <p className="muted" style={{ margin: 0, lineHeight: 1.55 }}>
                  NYCT is MTA. You do not use NYC OpenRecords (Request a Record) for this piece. You
                  file on the MTA FOIL portal. OIG records go to foil@mtaig.org, not this portal.
                </p>
              </div>
            </div>
          ) : agencyMatch ? (
            <div className="panel" style={{ gridColumn: '1 / -1' }}>
              <div className="panel-header">
                <span className="mono" style={{ fontSize: '0.8rem' }}>
                  CITY OPENRECORDS — YOU COPY THESE BOXES
                </span>
                <a className="btn btn-ghost" href={OPENRECORDS_URL} target="_blank" rel="noreferrer">
                  Open the form
                </a>
              </div>
              <div className="panel-body stack">
                <p className="muted" style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.55 }}>
                  After you submit, you receive a confirmation number so you can track the request.
                  The agency notifies you about how much time it needs.
                  {nypd
                    ? ' Payroll, medical, criminal-history, and collision-report requests listed on this form go to other desks, not the FOIL Unit.'
                    : ''}
                </p>
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>
                    CATEGORY (REQUIRED)
                  </span>
                  <input className="input" readOnly value={portalFields.category} />
                  <span className="dim" style={{ fontSize: '0.8rem' }}>
                    Selecting a category lists agencies in that group. Verify on the form.
                  </span>
                </label>
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>
                    AGENCY (REQUIRED)
                  </span>
                  <input className="input" readOnly value={portalFields.agency} />
                </label>
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>
                    REQUEST TITLE (REQUIRED) — PUBLIC
                  </span>
                  <input className="input" readOnly value={portalFields.title} />
                  <span className="dim" style={{ fontSize: '0.8rem' }}>
                    {portalFields.titleRemaining} characters remaining. {portalFields.publicNote} Ex:
                    Queens Blvd Roadwork Permit.
                  </span>
                </label>
                <label className="stack gap-sm">
                  <span className="dim mono" style={{ fontSize: '0.75rem' }}>
                    REQUEST DESCRIPTION (REQUIRED) — NOT PUBLIC
                  </span>
                  <textarea className="textarea" readOnly value={portalFields.description} rows={10} />
                  <span className="dim" style={{ fontSize: '0.8rem' }}>
                    {portalFields.descriptionRemaining} characters remaining. Type of records and
                    approximate date range. Month and year is enough.
                  </span>
                </label>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="panel">
          <div className="panel-header">
            <div className="row gap-sm">
              <Timer size={16} color="var(--cyan)" />
              <span className="mono" style={{ fontSize: '0.8rem' }}>
                DATES YOU WATCH
              </span>
            </div>
            <span className="badge">{pro ? 'Reminders on' : 'Reminders in Settings'}</span>
          </div>
          <div className="panel-body stack">
            <p className="muted" style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.55 }}>
              After you file, the agency generally has 5 business days to acknowledge. You update
              the status from their mail. You may appeal a denial within 30 calendar days.
            </p>
            {cases.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                No drafts yet. Answer the questions first.
              </p>
            ) : (
              cases.map((c) => (
                <article
                  key={c.id}
                  className="stack"
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                    background: 'rgba(0,0,0,0.25)',
                    opacity: pro ? 1 : 0.55,
                  }}
                >
                  <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <strong>
                      {c.agency} — {c.subject || 'FOIL draft'}
                    </strong>
                    <span className="badge">{STATUS_LABEL[c.status]}</span>
                  </div>
                  <input
                    className="input"
                    placeholder="FOIL number (from the agency)"
                    value={c.foilNumber}
                    disabled={!pro}
                    onChange={(e) => updateCase(c.id, { foilNumber: e.target.value })}
                  />
                  <label className="stack gap-sm">
                    <span className="dim mono" style={{ fontSize: '0.7rem' }}>
                      STATUS — YOU UPDATE THIS FROM THE AGENCY’S LETTER
                    </span>
                    <select
                      className="input"
                      disabled={!pro}
                      value={c.status}
                      onChange={(e) =>
                        updateCase(c.id, {
                          status: e.target.value as import('@plate/skill-packs').FoilCaseStatus,
                        })
                      }
                    >
                      {Object.entries(STATUS_LABEL).map(([k, lab]) => (
                        <option key={k} value={k}>
                          {lab}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="dim mono" style={{ fontSize: '0.75rem' }}>
                    Next check: {c.nextCheckAt ? new Date(c.nextCheckAt).toLocaleDateString() : '—'}
                    {c.lastResearchAt
                      ? ` · Last research tick ${new Date(c.lastResearchAt).toLocaleString()}`
                      : ''}
                  </div>
                  {c.lastResearchNote ? (
                    <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                      {c.lastResearchNote}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    className="btn"
                    disabled={!pro}
                    onClick={() => runTick(c.id)}
                  >
                    Note public sources to check
                  </button>
                </article>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
