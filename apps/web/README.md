# Eagle Intelligence — Web Frontend

Immersive, futuristic educational AI engine ecosystem for PLATE / Eagle.

## Run

From monorepo root (pnpm):

```bash
npx pnpm@9 install
cd apps/web && npx next dev -p 3000
```

Open [http://localhost:3000](http://localhost:3000).

## Modules

| Route | Surface |
|-------|---------|
| `/` | Command Deck — ecosystem hub + AI core |
| `/engine` | Interactive AI Engine chat |
| `/vault` | Secure document vault (demo local-first) |
| `/officers` | Public CCRB-style officer lookup (demo data) |
| `/foil` | Educational FOIL request draft builder |
| `/research` | Public-domain research desk |
| `/timeline` | Suggested chronology draft |
| `/settings` | Privacy, consent, copy audit, delete data |

## Compliance posture

- First-use consent gate (not legal advice)
- Persistent educational / AI disclaimers
- No “win your case” / guarantee language
- FOIL builder labels drafts as educational samples
- Settings includes phrase-swap audit + local data wipe

## Next upgrades

- Wire Engine to `packages/api` LLM orchestration
- Real CCRB/Socrata officer search
- True vault encryption + biometric gate
- StoreKit / IAP when shipping iOS shell
- WebGL / R3F hyper-real core (optional visual layer)
