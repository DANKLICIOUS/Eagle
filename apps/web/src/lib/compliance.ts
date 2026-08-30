/** App Store–aligned educational framing for Eagle Intelligence. */

export const LEGAL_DISCLAIMER =
  'Eagle provides educational legal information only. It is not a substitute for a licensed attorney and does not create an attorney–client relationship.';

export const AI_OUTPUT_DISCLAIMER =
  'AI-generated content is for educational purposes only. Verify important details and consult a licensed attorney before relying on any output.';

export const CONSENT_VERSION = '2026-08-08';

export const CONSENT_STORAGE_KEY = 'eagle.consent.v1';

export type ConsentRecord = {
  version: string;
  acceptedAt: string;
  understoodNotLegalAdvice: boolean;
};

export function loadConsent(): ConsentRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(record: ConsentRecord): void {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
}

/** Risky → compliant phrase map (metadata + in-app copy audits). Aligned with skill-packs. */
export const PHRASE_SWAPS: Array<{ risky: string; compliant: string }> = [
  { risky: 'Win your case', compliant: 'Understand your case' },
  { risky: 'Guaranteed defense', compliant: 'Educational defense concepts' },
  { risky: 'Beat the courts', compliant: 'Navigate the court system' },
  { risky: 'Legal loopholes', compliant: 'Common legal concepts to research' },
  { risky: 'Solve immediately', compliant: 'Learn to address effectively' },
  { risky: 'File Now!', compliant: 'Generate educational draft' },
  { risky: 'Defense guidance', compliant: 'Learn how defenses are discussed in educational materials' },
];

export const MODULES = [
  {
    id: 'engine',
    href: '/engine',
    title: 'AI Engine',
    tagline: 'Interactive legal education core',
    description:
      'Ask questions, understand process, and explore public-record patterns with clear educational framing.',
  },
  {
    id: 'vault',
    href: '/vault',
    title: 'Secure Vault',
    tagline: 'Encrypted document organization',
    description:
      'Organize case files with device-local privacy controls. Your documents stay under your control.',
  },
  {
    id: 'officers',
    href: '/officers',
    title: 'Officer Lookup',
    tagline: 'Public CCRB accountability data',
    description:
      'Search public misconduct records by name, badge, or precinct from open data sources.',
  },
  {
    id: 'foil',
    href: '/foil',
    title: 'FOIL',
    tagline: 'You request records',
    description:
      'Answer a few questions, then prepare a NY FOIL draft you file yourself. After you file, you watch the dates.',
  },
  {
    id: 'research',
    href: '/research',
    title: 'Research Desk',
    tagline: 'Public-domain statutes & notes',
    description:
      'Browse public-domain decisions and statutes with source attribution.',
  },
  {
    id: 'timeline',
    href: '/timeline',
    title: 'Timeline Draft',
    tagline: 'Suggested chronology builder',
    description:
      'Draft an initial timeline of events to review with counsel — not a filing.',
  },
  {
    id: 'flows',
    href: '/flows',
    title: 'Langflow Studio',
    tagline: 'Visual agent pipelines',
    description:
      'Design multi-step educational agent flows in Langflow and run them from Eagle.',
  },
] as const;
