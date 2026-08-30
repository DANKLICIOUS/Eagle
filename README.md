# PLATE - Pro Se Legal Accountability & Transparency Engine

A unified system enabling self-representing individuals to access their own legal records and expose patterns of police misconduct through public accountability data.

## Architecture Overview

**Approach 3: Unified API with Dual Interfaces**

```
┌─────────────────────────────────────────────────────────┐
│                    UNIFIED API                          │
│  (Node.js/TypeScript on Supabase Edge Functions)        │
│                                                         │
│  • /officers - search, filter, get details             │
│  • /foil - generate requests, templates                │
│  • /submissions - accept user-uploaded evidence        │
│  • /search - cross-reference data                      │
└─────────────────────────────────────────────────────────┘
                    ↓           ↓           ↓
        ┌───────────┴───────────┴───────────┴──────────┐
        │                                               │
    ┌───────────┐                              ┌───────────┐
    │  WEB APP  │                              │  CLI TOOL │
    │ (Next.js) │                              │(TypeScript)
    │           │                              │           │
    │ Officer   │                              │ FOIL Gen  │
    │ Lookup    │                              │ Personal  │
    │ Dashboard │                              │ Records   │
    └───────────┘                              └───────────┘
        (Public)                                (Power Users)
        
        ↓           ↓           ↓
┌─────────────────────────────────────────────────────────┐
│                  PostgreSQL (Supabase)                  │
│                                                         │
│  • officers (name, badge, precinct, complaints)        │
│  • complaints (CCRB, court records, charges)           │
│  • foil_templates (by agency, jurisdiction)            │
│  • submissions (user-uploaded evidence)                │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
plate/
├── apps/
│   ├── web/          # Next.js web dashboard (Officer Lookup)
│   └── cli/          # TypeScript CLI (FOIL Automation)
├── packages/
│   ├── api/          # Unified backend API service
│   └── database/     # PostgreSQL schema & types
├── supabase/
│   ├── functions/    # Edge function handlers
│   └── migrations/   # SQL migration files
└── README.md
```

## MVP Features

### Feature B: Officer Lookup
Search public misconduct records by officer name, badge, or precinct. View:
- CCRB complaint history
- Allegation categories
- Board dispositions
- Substantiation status
- Active vs resolved cases

### Feature D: FOIL Request Builder
Automated legal document generator creating demands under NY Public Officers Law Article 6:
- NYPD officer records (memo books, dispatch logs, BWC footage)
- CCRB complaint records
- Multi-incident tracking documentation

## Getting Started

```bash
cd /Users/ganesh/Eagle

# Install dependencies
npx pnpm@9 install
cd packages/skill-packs && npx tsc && cd ../..

# Web (immersive AI engine)
cd apps/web && npx next dev -p 3000

# API (optional — educational agent + FOIL/officers; set ANTHROPIC_API_KEY for live LLM)
cd packages/api && npx ts-node src/index.ts
```

Educational skill packs (claude-for-legal adapted): see `docs/CLAUDE_FOR_LEGAL_INTEGRATION.md`.  
Langflow visual flows: see `docs/LANGFLOW_INTEGRATION.md` · `docker-compose.langflow.yml`  
Engine: http://localhost:3000/engine · Flows: http://localhost:3000/flows · Agent: http://localhost:3001/api/agent/skills


## Database Schema

### officer_profiles
- `tax_id` (PRIMARY KEY, VARCHAR(9))
- First/last name, badge number, precinct
- Aggregated counts: active allegations, substantiated, exonerated
- Timestamps for audit trail

### ccrb_allegations
- `complaint_id` (UNIQUE, from NYC Open Data 6xgr-kwjq)
- Foreign key to `officer_profiles(tax_id)`
- Allegation type, board disposition, status
- Incident date/location/precinct

### foil_requests
- Request tracking: submitted date, deadline, status
- Related officer reference
- Document description and notes
- Agency and jurisdiction targeting

## Data Sources

### Primary: NYC CCRB Open Data
- **Endpoint**: https://data.cityofnewyork.us/resource/6xgr-kwjq.json
- **Query Support**: By officer name, tax_id, precinct
- **Fields**: complaint_id, fado_type, allegation, board_disposition, status

## Legal Foundation

All requests cite **NY Public Officers Law Article 6 (FOIL)**:
- § 84: Public right to access agency records
- § 87: Narrow exemptions (investigated, but most police records are public)
- § 89: 5-day acknowledgment, 20-day response deadline

## Tech Stack

- **API**: Node.js/TypeScript
- **Web**: Next.js 14 with TypeScript
- **CLI**: TypeScript with yargs
- **Database**: PostgreSQL via Supabase
- **Authentication**: Shopify OAuth pattern (adaptable to multi-provider)
- **Testing**: Vitest
- **Deployment**: Vercel (web), npm registry (CLI)

## Contributing

All code must:
- Be production-ready TypeScript
- Include comprehensive types
- Pass linting and tests
- Be independently importable across packages

No temporary scripts, placeholder code, or untracked changes.

## License

MIT
