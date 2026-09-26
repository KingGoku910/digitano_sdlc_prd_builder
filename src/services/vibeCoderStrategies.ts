/**
 * Vibe-Coder Prompt Strategy Engine
 * Offers diverse prompt engineering strategies for AI coding assistants:
 * - OneShot (Default): Direct, high-context complete specification with concrete implementation patterns.
 * - ZeroShot: Pure specification describing desired inputs, outputs, and constraints without pre-baked examples.
 * - RolePrompt: Deep persona-driven prompting (e.g. Senior Principal Staff Architect at Stripe/Vercel).
 * - PromptChain: Step-by-step phased execution chain (Scaffold -> Schema -> Core Business Logic -> Tests -> Deploy).
 * - MultiShot: Includes multiple concrete code snippets, schema pairs, and example API roundtrips.
 */

export type PromptStrategyType = "oneshot" | "zeroshot" | "role" | "promptchain" | "multishot";

export interface StrategyDefinition {
  id: PromptStrategyType;
  label: string;
  badge: string;
  description: string;
  recommendedFor: string;
}

export const STRATEGY_DEFINITIONS: StrategyDefinition[] = [
  {
    id: "oneshot",
    label: "One-Shot (Default)",
    badge: "Recommended",
    description: "Complete context with clear execution boundaries and high-fidelity reference patterns.",
    recommendedFor: "Bolt.new, Cursor, Claude Code, Windsurf",
  },
  {
    id: "zeroshot",
    label: "Zero-Shot",
    badge: "Direct & Fast",
    description: "Pure declarative specification focusing strictly on inputs, outputs, schemas, and constraints.",
    recommendedFor: "v0.dev, Lovable, Replit",
  },
  {
    id: "role",
    label: "Role-Based (Persona)",
    badge: "Senior Staff",
    description: "Deep persona instruction embodying a 10x Staff Engineer enforcing strict enterprise standards.",
    recommendedFor: "Claude 3.7 Sonnet, ChatGPT 4.5, Cursor Composer",
  },
  {
    id: "promptchain",
    label: "Prompt Chain (Phased)",
    badge: "Multi-Step",
    description: "Sequential 4-phase roadmap ensuring the AI builds scaffold, schema, logic, and tests step-by-step.",
    recommendedFor: "Autonomous agents, Cline, Claude Code CLI",
  },
  {
    id: "multishot",
    label: "Multi-Shot (Examples)",
    badge: "High-Fidelity",
    description: "Rich examples including input/output pairs, data contracts, and production component templates.",
    recommendedFor: "Complex domain apps, Fintech, HealthTech, AI Agents",
  },
];

export function generateVibePromptsForStrategy(
  strategy: PromptStrategyType,
  projectTitle: string,
  userPrompt: string,
  artifacts?: {
    prd?: string;
    schema?: string;
    api?: string;
  }
) {
  const brief = userPrompt.trim() || projectTitle;

  if (strategy === "zeroshot") {
    return [
      {
        id: "vibe_01",
        title: `Zero-Shot Frontend Blueprint: ${projectTitle}`,
        target: "v0.dev / Lovable",
        strategy: "zeroshot",
        content: `SPECIFICATION: Build the production frontend for "${projectTitle}".
REQUIREMENTS:
- Core Purpose: ${brief}
- Tech Stack: Next.js 16 App Router, React 19, Tailwind CSS v4, Lucide React icons.
- Screens to build:
  1. Main Dashboard / Feed with interactive state and instant optimistic feedback.
  2. Creation / Upload modal with rich validation and progress indicator.
  3. Detail Drawer / View with analytics and social/operational metrics.
- UI Theme: Ultra-dark cybernetic (#0B0F17 background, #131924 cards with #1E293B borders, cyan-blue gradients).
- Zero placeholder mockups: Wire fully working state hooks, clean responsive layouts, and accessible keyboard navigation.`,
      },
      {
        id: "vibe_02",
        title: `Zero-Shot Backend & DB Schema: ${projectTitle}`,
        target: "Claude Code / Cursor",
        strategy: "zeroshot",
        content: `SPECIFICATION: Build backend API and persistence layer for "${projectTitle}".
REQUIREMENTS:
- Domain Brief: ${brief}
- Runtime: Python FastAPI or Node.js Express with strict Pydantic/Zod schemas.
- Database: Single-Table DynamoDB or Relational SQL with normalized relationships.
- Endpoints:
  * GET /api/items (paginated list with filter query params)
  * POST /api/items (create item with validation)
  * GET /api/items/:id (retrieve single record)
  * POST /api/items/:id/action (perform domain action)
- Security: Bearer JWT validation, CORS origin whitelist, strict input sanitization.`,
      },
      {
        id: "vibe_03",
        title: `Zero-Shot End-to-End Delivery: ${projectTitle}`,
        target: "Bolt.new / Replit",
        strategy: "zeroshot",
        content: `SPECIFICATION: Full-stack integration for "${projectTitle}".
REQUIREMENTS:
- Connect Next.js client to backend endpoints via Axios with Bearer token interceptor.
- Implement real-time progress / event stream (SSE or WebSocket).
- Deploy configuration for Netlify/Vercel (frontend) and Render/Fly.io (backend).
- Include comprehensive end-to-end smoke test validating the primary user journey for "${brief}".`,
      },
    ];
  }

  if (strategy === "role") {
    return [
      {
        id: "vibe_01",
        title: `Staff Frontend Architect Persona: ${projectTitle}`,
        target: "Cursor Composer / Claude 3.7",
        strategy: "role",
        content: `You are a Principal Frontend Architect at Stripe and Vercel. You are tasked with delivering the user interface for: "${projectTitle}".
Brief: "${brief}"

ARCHITECTURAL PRINCIPLES:
1. Zero-Jank UI: Implement smooth 60fps micro-animations, optimistic state transitions, and responsive fluid typography.
2. State Architecture: Decompose state into custom modular hooks (e.g. useProjectState, useDomainActions) with SWR/TanStack Query caching.
3. Component Hierarchy:
   - Layout: Collapsible responsive sidebar, top breadcrumbs with status badges, and main viewport.
   - Core Action Canvas: Primary interaction for ${projectTitle} with immediate tactile feedback.
   - Resilient Error Boundaries: Graceful fallback cards on network or validation errors.
4. Styling: Tailwind CSS cybernetic palette (#0B0F17, #131924, cyan/blue highlights).

Produce complete, production-ready React component code without omitting boilerplate or using placeholders.`,
      },
      {
        id: "vibe_02",
        title: `Principal Cloud & Distributed Systems Lead: ${projectTitle}`,
        target: "Claude Code / Cursor",
        strategy: "role",
        content: `You are a Senior Principal Distributed Systems Engineer at AWS. Design and write the backend engine for: "${projectTitle}".
Brief: "${brief}"

MANDATORY SPECIFICATIONS:
1. Single-Table DynamoDB Architecture:
   - Partition Key: USER#<userId>
   - Sort Key: PROJECT#<projectId> | ITEM#<itemId>
   - GSI1 for chronological querying (GSI1PK: STATUS#<status>, GSI1SK: TIMESTAMP#<iso>)
2. API Gateway & Fast Engine:
   - FastAPI server with async/await handlers and sub-50ms execution overhead.
   - JWT validation against RS256 JWKS endpoint.
3. Resilient Error Handling:
   - Exponential backoff retry on AWS DynamoDB throttles (ProvisionedThroughputExceededException).
   - Structured JSON logging with trace IDs.

Write the complete FastAPI router and DynamoDB persistence service.`,
      },
      {
        id: "vibe_03",
        title: `Full-Stack Release Commander: ${projectTitle}`,
        target: "Bolt.new / Windsurf",
        strategy: "role",
        content: `You are the Lead Release Commander responsible for the zero-downtime launch of: "${projectTitle}".
Brief: "${brief}"

EXECUTION PROTOCOL:
1. Wire frontend client hooks directly to backend routes.
2. Provide Dockerfile and render.yaml infrastructure-as-code configuration.
3. Add health-check watchdog polling GET /api/health every 10 seconds.
4. Verify end-to-end: User signs in -> creates project -> receives real-time streamed updates -> exports verified deliverables.`,
      },
    ];
  }

  if (strategy === "promptchain") {
    return [
      {
        id: "vibe_01",
        title: `Phase 1: Project Scaffold & State Primitives (${projectTitle})`,
        target: "Claude Code / Cursor",
        strategy: "promptchain",
        content: `[PHASE 1 of 4: FOUNDATIONS]
Project: "${projectTitle}" - "${brief}"

TASKS:
1. Initialize Next.js 16 App Router workspace with Tailwind CSS v4 and Lucide React.
2. Define TypeScript types for all domain models: User, ProjectItem, ActivityLog, StatusEnum.
3. Create client API service client in src/services/api.ts with Axios and Bearer token interceptor.
4. Create global theme provider and cybernetic design tokens.

STOP after Phase 1 and verify all type declarations pass compile checks before moving to Phase 2.`,
      },
      {
        id: "vibe_02",
        title: `Phase 2: Database Schema & REST Route Handlers (${projectTitle})`,
        target: "Claude Code / Cursor",
        strategy: "promptchain",
        content: `[PHASE 2 of 4: BACKEND & STORAGE]
Project: "${projectTitle}" - "${brief}"

TASKS:
1. Implement the database persistence layer (Single-Table DynamoDB schema or PostgreSQL schema).
2. Write CRUD service methods with automated partition key and sort key formatting.
3. Write FastAPI route handlers for items list, create, detail, update, and action triggers.
4. Add automated unit test stubs asserting 200 OK responses with mock payloads.

STOP after Phase 2 and confirm all endpoint schemas match API specifications.`,
      },
      {
        id: "vibe_03",
        title: `Phase 3 & 4: Interactive UI, Real-Time Streams & Polish (${projectTitle})`,
        target: "Bolt.new / Cursor",
        strategy: "promptchain",
        content: `[PHASE 3 & 4: INTERACTION & LAUNCH]
Project: "${projectTitle}" - "${brief}"

TASKS:
1. Build the primary user interface: responsive views, drag/click interactions, and modals.
2. Wire real-time Server-Sent Events (SSE) or WebSocket streaming to render dynamic updates.
3. Implement 15-minute inactivity session watchdog and secure cookie persistence.
4. Add one-click export and download triggers for all generated deliverables (.md, .json, .zip).
5. Verify build compiles cleanly with zero TypeScript errors.`,
      },
    ];
  }

  if (strategy === "multishot") {
    return [
      {
        id: "vibe_01",
        title: `Multi-Shot Frontend Components & Hooks: ${projectTitle}`,
        target: "Cursor / Windsurf",
        strategy: "multishot",
        content: `Build the frontend for "${projectTitle}" (${brief}).

EXAMPLE PATTERN A (Custom Hook with Optimistic Updates):
\`\`\`tsx
export function useDomainItems() {
  const [items, setItems] = useState<Item[]>([]);
  const addItem = async (newItem: ItemInput) => {
    const tempId = "temp_" + Date.now();
    setItems((prev) => [{ ...newItem, id: tempId, pending: true }, ...prev]);
    try {
      const res = await api.post("/api/items", newItem);
      setItems((prev) => prev.map((it) => it.id === tempId ? res.data : it));
    } catch (err) {
      setItems((prev) => prev.filter((it) => it.id !== tempId));
      throw err;
    }
  };
  return { items, addItem };
}
\`\`\`

EXAMPLE PATTERN B (Cybernetic Surface Card):
\`\`\`tsx
<div className="rounded-2xl bg-[#131924] border border-[#1E293B] p-5 hover:border-cyan-500/40 transition-all shadow-lg">
  <div className="flex items-center justify-between mb-3">
    <span className="text-xs font-mono text-cyan-400">ACTIVE SESSION</span>
  </div>
</div>
\`\`\`

TASK: Use the patterns above to build the complete, responsive UI for "${projectTitle}".`,
      },
      {
        id: "vibe_02",
        title: `Multi-Shot DynamoDB & Endpoint Contracts: ${projectTitle}`,
        target: "Claude Code / Cursor",
        strategy: "multishot",
        content: `Implement the backend API and Single-Table DynamoDB engine for "${projectTitle}" (${brief}).

EXAMPLE RECORD (DynamoDB Single-Table):
\`\`\`json
{
  "PK": "USER#us-east-1_09a12b3c",
  "SK": "PROJECT#${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}",
  "type": "PROJECT_RECORD",
  "title": "${projectTitle}",
  "status": "ACTIVE",
  "created_at": "${new Date().toISOString()}",
  "metrics": { "views": 142, "ratings_avg": 8.7 }
}
\`\`\`

EXAMPLE FASTAPI HANDLER:
\`\`\`python
@router.post("/api/items")
async def create_item(payload: ItemCreateSchema, user=Depends(verify_cognito_jwt)):
    item = dynamo_service.save_item(user["sub"], payload.dict())
    return {"success": True, "item": item}
\`\`\`

TASK: Implement all endpoints and database methods for "${projectTitle}" following these exact patterns.`,
      },
      {
        id: "vibe_03",
        title: `Multi-Shot Cloud Deployment & Integration: ${projectTitle}`,
        target: "Bolt.new / Lovable",
        strategy: "multishot",
        content: `Deploy and wire the complete stack for "${projectTitle}".

EXAMPLE NETLIFY CONFIG (netlify.toml):
\`\`\`toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
\`\`\`

TASK: Configure full-stack integration, proxy rules, and environment variables to launch "${projectTitle}".`,
      },
    ];
  }

  // DEFAULT: ONE-SHOT (Recommended)
  return [
    {
      id: "vibe_01",
      title: `Vibe Prompt #1: Next.js Frontend Core & UI Experience for ${projectTitle}`,
      target: "Frontend Architect / Cursor",
      strategy: "oneshot",
      content: `Build the production frontend application for '${projectTitle}'.

Original Project Brief:
"${brief}"

Frontend Requirements:
- Build responsive, modern screens using Next.js App Router and Tailwind CSS.
- Implement the interactive user flows: screen transitions, modals, user inputs, and live feedback.
- Use Lucide React icons for clean, modern iconography.
- Set up a clean state management layer with custom React hooks.
- Configure an Axios API service layer with request/response interceptors and error boundaries.
- Theme: Ultra-dark cybernetic (#0B0F17 background, #131924 cards with #1E293B borders, cyan-to-blue linear gradients #06B6D4 to #3B82F6).`,
    },
    {
      id: "vibe_02",
      title: `Vibe Prompt #2: Backend Services, Database Schema & API for ${projectTitle}`,
      target: "Backend Architect / Claude Code",
      strategy: "oneshot",
      content: `Build the production backend API service and database persistence for '${projectTitle}'.

Original Project Brief:
"${brief}"

Backend Requirements:
- Implement REST API endpoints with Pydantic / TypeScript request validation schemas.
- Implement the database schema (entities, collections/tables, relationships, and queries) required for '${projectTitle}'.
- Provide authentication middleware (Cognito / JWT), CORS whitelist, and robust error handling.
- Include a health check route GET /api/health and comprehensive test stubs.`,
    },
    {
      id: "vibe_03",
      title: `Vibe Prompt #3: Full-Stack Integration & Cloud Deployment for ${projectTitle}`,
      target: "Full Stack Integrator / Bolt.new",
      strategy: "oneshot",
      content: `Wire end-to-end integration and cloud deployment for '${projectTitle}'.

Original Project Brief:
"${brief}"

Integration & Cloud Tasks:
- Connect the frontend client to the backend endpoints with real-time UI updates.
- Set up cloud object storage for any file/media uploads required by the application.
- Configure environment variables and deployment scripts for production hosting (Netlify frontend, Render/AWS backend).
- Verify end-to-end user journeys from onboarding through core actions.`,
    },
  ];
}
