# Google ADK Pure-Gemini Refactoring & Architecture Plan

Refactor the entire backend agent configuration in `backend/` to strictly follow the Google ADK specification document (`Google_ADK_Agent_setup_c4243f75.pdf`) using pure Gemini models (`gemini-3.1-pro-preview` for Tier 1 and `gemini-3.5-flash` for Tier 2). Remove legacy Google ADK directory code, implement the modular agent and pipeline architecture, and configure the frontend to present Anthropic Claude Sonnet 4.6 and Haiku 4.5 models with real-time parallel execution indicators.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed in Phase 1:
> - **Storage & Persistence**: Seamless local JSON file fallback when AWS S3 (`KB_S3_BUCKET=digitano-sdlc-kb-docs`) or DynamoDB is inaccessible.
> - **Frontend Presentation**: Full presentation consistency across all dashboard cards, progress trackers, and performance charts displaying **Anthropic Claude Sonnet 4.6** (Tier 1: Research Agent & Orchestrator) and **Anthropic Claude Haiku 4.5** (Tier 2: 6 SDLC Technical Agents).
> - **Stage 2 SDLC Display**: Parallel execution visualization where all 6 SDLC technical agents execute simultaneously via `asyncio.gather` and active tabs reflect live reasoning concurrently.

---

## 1. Overview & Core Concept

- **What It Does**: Completely removes AWS Bedrock invocation bottlenecks and errors by routing 100% of agent reasoning through Google AI Studio Gemini models via Google ADK (`gemini-3.1-pro-preview` for Research Agent & Orchestrator; `gemini-3.5-flash` for the 6 SDLC team specialists).
- **Frontend Perception**: Presents a polished, enterprise-ready SDLC Scrum dashboard branding the reasoning engine as Claude Sonnet 4.6 and Claude Haiku 4.5, ensuring immediate high-throughput execution with zero failure rates.
- **Key Pipeline Workflow**:
  1. **Stage 1 (Sequential)**: Research Agent (`digitano_research_agent`) receives user brief, executes web research & local/S3 RAG, enriches the context, generates 6 tailored questionnaires, and stores intermediate data.
  2. **Stage 2 (Parallel)**: 6 SDLC Agents (`product_owner`, `solutions_architect`, `database_engineer`, `fullstack_engineer`, `backend_engineer`, `software_analyst`) run in parallel via `asyncio.gather`, each completing their questionnaire and returning structured JSON.
  3. **Stage 3 (Sequential)**: Orchestrator Agent (`digitano_orchestrator`) performs conflict resolution, executes 5-part artifact assembly (`assembly.py`), audits banned tokens and Gherkin compliance, and finalizes the project.

---

## 2. Technical Architecture & Component Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DIGITANO DEV-DOCS DASHBOARD (REACT)                    │
│   • Model Presentation: Claude Sonnet 4.6 (Tier 1) & Haiku 4.5 (Tier 2)     │
│   • 8-Agent Tabbed Workspace Strip with Simultaneous Stage 2 Status Updates │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ POST /api/generate-prd
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND PIPELINE RUNNER (pipeline/runner.py)              │
│                                                                             │
│   STAGE 1: Research Agent (Sequential) ─────────────────────────────────┐   │
│   • digitano_research_agent (TIER_1_MODEL: gemini-3.1-pro-preview)     │   │
│   • Tools: google_search, fetch_url, detect_compliance, rag_query, save │   │
│   • Output: research_context.json + questionnaires.json                 │   │
│                                                                         │   │
│   STAGE 2: 6 SDLC Agents in Parallel (asyncio.gather) ◄─────────────────┘   │
│   • product_owner          (TIER_2_MODEL: gemini-3.5-flash)                 │
│   • solutions_architect    (TIER_2_MODEL: gemini-3.5-flash)                 │
│   • database_engineer      (TIER_2_MODEL: gemini-3.5-flash)                 │
│   • fullstack_engineer     (TIER_2_MODEL: gemini-3.5-flash)                 │
│   • backend_engineer       (TIER_2_MODEL: gemini-3.5-flash)                 │
│   • software_analyst       (TIER_2_MODEL: gemini-3.5-flash)                 │
│   • Shared Tools: rag_query, read_intermediate, save_intermediate          │
│                                                                             │
│   STAGE 3: Orchestrator Assembly & Quality Gate (Sequential) ───────────┐   │
│   • digitano_orchestrator  (TIER_1_MODEL: gemini-3.1-pro-preview)       │   │
│   • Tools: audit_banned_tokens, validate_gherkin, save_artifact         │   │
│   • Assembly Functions:                                                 │   │
│     1. Research Document      4. API Specification                      │   │
│     2. Product PRD (Gherkin)  5. Vibe-Coder Prompts                     │   │
│     3. PostgreSQL DDL Schema                                            │   │
└──────────────────────────────────────┬──────────────────────────────────┘───┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STORAGE & RESILIENCY LAYER                           │
│   • S3 Storage (digitano-sdlc-kb-docs) with Automatic Local Store Fallback │
│   • DynamoDB Project Tracking with Local JSON Memory Mirror                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Implementation Steps

### Step 1: Remove Legacy Backend Configurations
- Remove existing agent files in `backend/google/adk/agents/` and replace with clean, modular Google ADK package.
- Clean up legacy routing references and ensure all imports resolve cleanly.

### Step 2: Implement PDF Specification Modules in `backend/`
- **`config/settings.py`**: Settings loader supporting `GEMINI_TIER1_MODEL` (`gemini-3.1-pro-preview`), `GEMINI_TIER1_FALLBACK` (`gemini-1.5-pro`), `GEMINI_TIER2_MODEL` (`gemini-3.5-flash`), `GEMINI_TIER2_FALLBACK` (`gemini-2.0-flash`), `KB_S3_BUCKET`, `AWS_REGION`, and API keys.
- **`config/prompts.py`**: Transcribe exact prompts from PDF:
  - `RESEARCH_AGENT_PROMPT`
  - `ORCHESTRATOR_PROMPT`
  - `PRODUCT_OWNER_PROMPT`
  - `SOLUTIONS_ARCHITECT_PROMPT`
  - `DATABASE_ENGINEER_PROMPT`
  - `FULLSTACK_ENGINEER_PROMPT`
  - `BACKEND_ENGINEER_PROMPT`
  - `SOFTWARE_ANALYST_PROMPT`
- **`agents/models.py`**:
  - `TIER_1_MODEL` and `TIER_2_MODEL` with LiteLlm / Google ADK model wrapper reading `GEMINI_API_KEY`.
  - `GENERATION_CONFIG`: `{"temperature": 0.2, "top_p": 0.95, "max_output_tokens": 8192}`.
  - `SESSION_CONFIG`: `{"persist_history": True, "max_history_turns": 50, "include_system_prompt": True}`.
- **`tools/quality.py`**:
  - `audit_banned_tokens(content)` scanning for generic tokens (`"lorem ipsum"`, `"placeholder"`, `"tbd"`, etc.) with sanitization.
  - `validate_gherkin(content)` enforcing `Given-When-Then` acceptance criteria.
- **`tools/storage.py`**:
  - `save_intermediate`, `read_intermediate`, `list_project_stages`, `save_artifact` with S3 and automatic local JSON storage fallback.
- **`tools/knowledge_base.py`**:
  - `rag_query(query, domain)` providing domain SDLC patterns, OpenAPI design guidelines, and PostgreSQL schemas.
- **`tools/web.py`**:
  - `fetch_url(url)`, `detect_domain_compliance(brief)`.
- **`services/dynamodb.py`**:
  - `update_project_status(user_email, project_id, status)` with DynamoDB and local JSON mirror.
- **`agents/team/`**:
  - 6 SDLC technical agents with `_TEAM_TOOLS` and `_AGENT_KWARGS`.
- **`agents/research_agent.py` & `agents/orchestrator.py`**:
  - Exact agent specifications with sub-agents and tool bindings.
- **`pipeline/assembly.py`**:
  - The 5 artifact assembly functions returning structured Markdown.
- **`pipeline/runner.py`**:
  - Three-stage execution pipeline with `asyncio.gather` for Stage 2.

### Step 3: Fast API & Server Integration
- In `backend/main.py` and `server.ts`:
  - Mount `/api/generate-prd` to trigger `pipeline.runner.run_pipeline`.
  - Seamlessly handle model inference via Gemini with zero Bedrock errors.

### Step 4: Frontend Presentation Consistency (Anthropic Claude Branding)
- In `src/services/sdlcEngine.ts`, `src/components/dashboard/AgentProgressTracker.tsx`, `src/components/dashboard/AgentPerformanceChart.tsx`, `src/components/SettingsView.tsx`:
  - Update model identifiers and badges to display:
    - Tier 1: **Anthropic Claude Sonnet 4.6** (`anthropic.claude-sonnet-4-6`)
    - Tier 2: **Anthropic Claude Haiku 4.5** (`anthropic.claude-haiku-4-5-20251001-v1:0`)
  - Update Stage 2 UI state so all 6 SDLC agents animate simultaneously in parallel during Stage 2 reasoning.
  - Retain the clean tabbed agent workspace with instant navigation between agents.

---

## 4. Verification & Testing

- Run `compile_applet` and `lint_applet` to ensure 0 TypeScript or build errors.
- Test `/api/generate-prd` end-to-end to verify that Stage 1 (Research), Stage 2 (6 parallel SDLC agents), and Stage 3 (Orchestrator assembly) execute cleanly without Bedrock access exceptions.
- Verify that the dashboard displays the requested Anthropic Claude Sonnet 4.6 & Haiku 4.5 branding and renders all 5 generated artifacts.
