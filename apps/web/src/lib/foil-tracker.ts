import {
  FOIL_PRO,
  addBusinessDays,
  defaultTimer,
  type FoilCase,
  type FoilCaseStatus,
  type FoilTimer,
} from '@plate/skill-packs';

export type { FoilCase, FoilCaseStatus, FoilTimer };

function nid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function loadCases(): FoilCase[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FOIL_PRO.storage.cases);
    return raw ? (JSON.parse(raw) as FoilCase[]) : [];
  } catch {
    return [];
  }
}

export function saveCases(cases: FoilCase[]) {
  localStorage.setItem(FOIL_PRO.storage.cases, JSON.stringify(cases));
}

export function loadTimer(): FoilTimer {
  if (typeof window === 'undefined') return defaultTimer();
  try {
    const raw = localStorage.getItem(FOIL_PRO.storage.timer);
    if (!raw) return defaultTimer();
    const t = JSON.parse(raw) as FoilTimer;
    const hours = Math.min(
      FOIL_PRO.timer.maxIntervalHours,
      Math.max(FOIL_PRO.timer.minIntervalHours, Number(t.intervalHours) || FOIL_PRO.timer.defaultIntervalHours)
    );
    return { enabled: Boolean(t.enabled), intervalHours: hours };
  } catch {
    return defaultTimer();
  }
}

export function saveTimer(t: FoilTimer) {
  localStorage.setItem(FOIL_PRO.storage.timer, JSON.stringify(t));
}

export function loadProUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(FOIL_PRO.storage.pro) === 'demo';
}

/** Demo unlock only — production must use Apple IAP (StoreKit / productId). */
export function setProUnlockedDemo(on: boolean) {
  if (on) localStorage.setItem(FOIL_PRO.storage.pro, 'demo');
  else localStorage.removeItem(FOIL_PRO.storage.pro);
}

export function newCase(partial: Partial<FoilCase> & { agency: string; draft: string }): FoilCase {
  const filedAt = partial.filedAt || '';
  return {
    id: nid(),
    createdAt: new Date().toISOString(),
    agency: partial.agency,
    subject: partial.subject || '',
    foilNumber: partial.foilNumber || '',
    filedAt,
    status: partial.status || (filedAt ? 'filed' : 'drafted'),
    lastAgencyAt: partial.lastAgencyAt || '',
    nextCheckAt: filedAt ? addBusinessDays(filedAt, 5) : '',
    lastResearchAt: '',
    lastResearchNote: '',
    draft: partial.draft,
  };
}

export function tickResearch(c: FoilCase): FoilCase {
  const q = encodeURIComponent(`${c.agency} FOIL Public Officers Law 87`);
  return {
    ...c,
    lastResearchAt: new Date().toISOString(),
    lastResearchNote: `Public sources to check (verify): CourtListener search for FOIL and “${c.agency}”; Public Officers Law § 87(2) exemptions; OpenData and MOS histories before you file again. https://www.courtlistener.com/?q=${q}`,
  };
}

export const STATUS_LABEL: Record<FoilCaseStatus, string> = {
  drafted: 'Drafted (not filed)',
  filed: 'Filed by you',
  acknowledged: 'Acknowledged',
  producing: 'Producing',
  denied: 'Denied (in part or full)',
  constructive_denial: 'No timely response',
  appeal_window: 'Appeal window',
};
