# Claude-for-Legal → Eagle Integration

**Sources**

| Repo | Path | Role |
|------|------|------|
| claude-for-legal | `/Users/ganesh/claude-for-legal` | Upstream skill patterns (Anthropic) |
| SuperClaude_Framework | `/Users/ganesh/SuperClaude_Framework` | **Dev workflow only** — not runtime |
| Eagle | `/Users/ganesh/Eagle` | Product runtime |

## What shipped

### Package `@plate/skill-packs`

Educational skill packs adapted from claude-for-legal:

| Skill id | Upstream pattern | Eagle modules |
|----------|------------------|---------------|
| `foil-ny` | `legal-clinic/skills/draft` | engine, foil |
| `ccrb-open-data` | research hygiene + open data | engine, officers |
| `research-start` | `legal-clinic/skills/research-start` | engine, research |
| `chronology` | `litigation-legal/skills/chronology` | engine, timeline |
| `constitutional-edu` | law-student real-matter check | engine, research |
| `educational-qa` | clinic pedagogy default | engine, vault, settings |

Shared guardrails (`GLOBAL_SYSTEM_PREAMBLE`, draft banner, banned phrases) mirror clinic/litigation “draft for attorney review / leads not authorities” rules, adapted for **non-lawyer educational** use.

### API

| Endpoint | Purpose |
|----------|---------|
| `GET /api/agent/skills` | List skill packs |
| `POST /api/agent/chat` | Skill-routed educational chat |
| `GET /api/agent/health` | LLM configured? skill count |

`LLMOrchestration` prompts rewritten to educational framing (no “legal expert” / “submit immediately”).

### Web

- `EngineChat` → prefers `POST /api/plate/agent/chat` (rewrite to port 3001)
- Offline fallback: static skill pack replies (still skill-routed)
- Per-message **AI-generated** + **skill id** badges

## Run

```bash
cd /Users/ganesh/Eagle
npx pnpm@9 install

# API (optional for live LLM — needs ANTHROPIC_API_KEY)
cd packages/api && npx ts-node src/index.ts

# Web
cd apps/web && npx next dev -p 3000
```

Open http://localhost:3000/engine

Without API key, engine still answers via static skill packs.

## SuperClaude

Use SuperClaude for **building** Eagle features only (`/sc:implement`, security-engineer, etc.).  
Do **not** import SuperClaude into the Next.js/Express runtime.

## Compliance notes

- Consent version: `2026-08-08`
- Every draft letter must open with educational AI banner
- Research skill: **LEADS, NOT AUTHORITIES**
- CCRB dispositions ≠ criminal guilt
- Never file/submit via the product
