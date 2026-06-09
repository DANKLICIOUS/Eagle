# PLATE Express API Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained Express.js API backend that ingests public CCRB data, processes it with LLM orchestration, stores in PostgreSQL, and serves officer misconduct context alongside auto-generated FOIL legal documents.

**Architecture:** 
- Express server with TypeScript/Supabase Edge Functions
- Socrata data sync from NYC Open Data (6xgr-kwjq)
- PostgreSQL legal ontology (officer profiles, allegations, coded legal analysis)
- LLM orchestration layer for unstructured data processing
- Three API routes: officer lookup, FOIL generation, data ingestion
- No external legal APIs — fully self-contained

**Tech Stack:** 
- Express.js, TypeScript, Supabase client, PostgreSQL, Anthropic SDK (Claude for LLM), node-fetch

---

## File Structure

### New Files to Create

**API Layer:**
- `packages/api/src/index.ts` - Express server setup
- `packages/api/src/routes/officers.ts` - Officer lookup endpoints
- `packages/api/src/routes/foil.ts` - FOIL generation endpoints
- `packages/api/src/routes/sync.ts` - Public data sync endpoints
- `packages/api/src/middleware/auth.ts` - JWT/request validation
- `packages/api/src/middleware/errorHandler.ts` - Centralized error handling

**Services:**
- `packages/api/src/services/socrata.ts` - Already exists; enhance for full sync
- `packages/api/src/services/llm-orchestration.ts` - LLM processing (Anthropic Claude)
- `packages/api/src/services/officer-analysis.ts` - Cross-reference and code allegations
- `packages/api/src/services/foil-context.ts` - Bake officer history into FOIL letters

**Database:**
- `packages/database/src/client.ts` - Supabase client initialization
- `packages/database/src/queries/officers.ts` - Officer CRUD operations
- `packages/database/src/queries/allegations.ts` - Allegation lookups
- `packages/database/src/queries/legal-analysis.ts` - Store LLM-generated analysis

**Tests:**
- `packages/api/tests/services/socrata.test.ts` - Socrata sync tests
- `packages/api/tests/routes/officers.test.ts` - Officer lookup tests
- `packages/api/tests/routes/foil.test.ts` - FOIL generation tests
- `packages/api/tests/services/llm-orchestration.test.ts` - LLM integration tests

**Configuration:**
- `packages/api/.env.example` - Environment template
- `packages/api/src/config.ts` - Centralized config management

---

## Tasks

### Task 1: Set Up Supabase Database Client & Connection

**Files:**
- Modify: `packages/api/tsconfig.json`
- Create: `packages/api/src/index.ts`
- Create: `packages/api/src/config.ts`
- Create: `packages/api/.env.example`

**Goal:** Initialize Express server with TypeScript, environment config, and basic routing structure.

[Full task steps as specified in plan...]

### Task 2: Set Up Supabase Database Client & Connection

**Files:**
- Create: `packages/database/src/client.ts`
- Create: `packages/database/src/queries/officers.ts`
- Create: `packages/database/src/queries/allegations.ts`
- Modify: `packages/database/src/index.ts`

**Goal:** Initialize Supabase client and create reusable database query functions with officer_profiles table anchored to 9-digit tax_id as PRIMARY KEY.

[Full task steps as specified in plan...]

### Task 3: Enhance Socrata Data Sync Service

**Files:**
- Modify: `packages/api/src/services/socrata.ts`
- Create: `packages/api/src/services/sync-manager.ts`
- Create: `packages/api/tests/services/socrata.test.ts`

**Goal:** Build full data sync pipeline from Socrata NYC Open Data into PostgreSQL with batch processing and error recovery.

### Task 4: Build LLM Orchestration Service (Claude Integration)

**Files:**
- Create: `packages/api/src/services/llm-orchestration.ts`
- Create: `packages/api/tests/services/llm-orchestration.test.ts`

**Goal:** Create LLM service using Anthropic Claude to process allegations, extract legal analysis, and contextualize FOIL requests.

### Task 5: Build Officer Lookup API Routes

**Files:**
- Create: `packages/api/src/routes/officers.ts`
- Create: `packages/api/src/middleware/errorHandler.ts`
- Create: `packages/api/tests/routes/officers.test.ts`

**Goal:** Expose officer lookup endpoints with allegation history and LLM-powered analysis.

### Task 6: Build FOIL Generation API Routes with Officer Context

**Files:**
- Modify: `packages/api/src/utils/foil-generator.ts` (enhance with context)
- Create: `packages/api/src/routes/foil.ts`
- Create: `packages/api/tests/routes/foil.test.ts`

**Goal:** Create FOIL endpoints that bake officer misconduct history directly into generated legal documents.

### Task 7: Build Data Sync Management API Routes

**Files:**
- Create: `packages/api/src/routes/sync.ts`
- Create: `packages/api/tests/routes/sync.test.ts`

**Goal:** Expose endpoints for triggering Socrata sync and monitoring sync progress.

### Task 8: Build Complete End-to-End Test & Verification

**Files:**
- Create: `packages/api/tests/e2e/foil-generation.test.ts`
- Create: `packages/api/README.md` (API documentation)

**Goal:** Verify full pipeline: officer lookup → LLM analysis → FOIL generation with misconduct context.

---
