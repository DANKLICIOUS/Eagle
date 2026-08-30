# Langflow → Eagle Integration

## Source

| Item | Path |
|------|------|
| Cloned repo | `/Users/ganesh/langflow` |
| origin | `gothamgodzilla/langflow` |
| upstream | `langflow-ai/langflow` |
| Docker compose | `Eagle/docker-compose.langflow.yml` |

## Architecture

```
Eagle Web (Anie + Engine + /flows)
    │
    ├─ skill packs (claude-for-legal adapted)
    │
    ▼
Eagle API :3001
    │
    ├─ /api/agent/chat  ──► skill router
    │         │
    │         ├─ Langflow POST /api/v1/run/{flow_id}  (if enabled + mapped)
    │         ├─ Anthropic direct
    │         └─ static skill fallback
    │
    └─ /api/langflow/*  ──► health, flows map, run proxy
              │
              ▼
         Langflow :7860  (visual flow studio)
```

## Visual references (product UX)

From your **info.ufo** mock:

| Reference | Eagle implementation |
|-----------|----------------------|
| Holographic vault | `/vault` green vault-hero + door |
| AI Legal Assistant “Anie” | Floating `AnieAssistant` panel (all pages) |
| Popular topics chips | 4th Amendment, Due Process, FOIL, timeline |
| Dashboard progress | Settings + engine skill badges |
| Multi-step access | Consent gate + module deck |

Langflow provides the **visual agent pipeline** layer (compose FOIL → research → timeline multi-step graphs).

## Quick start

```bash
# 1) Langflow
cd /Users/ganesh/Eagle
export LANGFLOW_SUPERUSER_PASSWORD='dev-password'
docker compose -f docker-compose.langflow.yml up -d
# UI: http://localhost:7860

# 2) Create flows in Langflow UI matching educational skills
#    Export flow UUID from the flow's API pane

# 3) Eagle API
export LANGFLOW_ENABLED=true
export LANGFLOW_BASE_URL=http://localhost:7860
export LANGFLOW_API_KEY='…'
export LANGFLOW_FLOW_FOIL='…uuid…'
export LANGFLOW_PREFER=true   # optional: Langflow before Anthropic
cd packages/api && npx ts-node src/index.ts

# 4) Web
cd apps/web && npx next dev -p 3000
# http://localhost:3000/flows
# http://localhost:3000/engine  (Anie dock bottom-right)
```

## Suggested Langflow flow templates

Build these in the Langflow UI (prompt components + Chat Input/Output):

1. **Eagle FOIL Coach** — system prompt from `@plate/skill-packs` `foil-ny`
2. **CCRB Literacy** — `ccrb-open-data` framing
3. **Research Roadmap** — “LEADS, NOT AUTHORITIES”
4. **Chronology Builder** — timeline structure only
5. **Anie Default** — educational Q&A + real-matter gate

Always inject Eagle’s educational system preamble (no legal expert persona, no “submit immediately”).

## Security

- Prefer Langflow **≥ 1.9.x** (compose pins `1.9.6`)
- Set `LANGFLOW_AUTO_LOGIN=false` on any shared network
- Keep Langflow behind localhost/VPN; do not expose unauthenticated build endpoints
- Never pass vault document content to Langflow without explicit AI opt-in

## API surface

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/langflow/health` | Reachability + map |
| GET | `/api/langflow/flows` | skill → flow IDs |
| POST | `/api/langflow/run` | `{ skillId\|flowId, message }` |

## SuperClaude / claude-for-legal

| Tool | Role |
|------|------|
| SuperClaude | Develop Eagle code |
| claude-for-legal | Skill prompt patterns |
| Langflow | Runtime visual orchestration of those skills |
