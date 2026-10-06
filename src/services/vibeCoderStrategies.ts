/**
 * Vibe-Coder Prompt Strategy Engine
 * Offers 13 battle-tested prompt engineering strategies for AI coding assistants:
 * 1. One-Shot: Gold standard reference pattern with high-fidelity templates.
 * 2. Zero-Shot: Pure declarative specification focusing strictly on contracts and inputs/outputs.
 * 3. Role-Based: Principal Staff Architect persona enforcing enterprise engineering discipline.
 * 4. Prompt Chaining: 5-phase sequential execution preventing hallucination.
 * 5. Multi-Shot: Concrete examples, input/output schemas, and code transformations.
 * 6. Chain-of-Thought (CoT): Step-by-step reasoning through architecture, state, and edge cases.
 * 7. Tree-of-Thoughts (ToT): Comparative evaluation of architectural trade-offs before implementation.
 * 8. Test-Driven (TDD): Red-Green-Refactor writing unit & integration test suites first.
 * 9. Meta-Prompting: Self-auditing and refining code against security and performance checklists.
 * 10. Modular Decoupled: Hexagonal/Clean architecture separating domain entities, services, and UI.
 * 11. Socratic Discovery: Assumption validation and interactive requirement hardening.
 * 12. Constraint-Hardened: OWASP Top 10 security, rate limits, and strict defensive programming.
 * 13. Vibe & Motion Polish: Micro-interactions, spring animations, and cybernetic dark aesthetics.
 *
 * All prompts strictly eliminate banned tokens ("item", "items", "data", "record", "/api/items", "TBD", "placeholder").
 */

import { detectDomainEntities } from "./domainSynthesizer";
import { sanitizeAndFormatMarkdown, sanitizeBannedTokens } from "./markdownSanitizer";

export type PromptStrategyType =
  | "oneshot"
  | "zeroshot"
  | "role"
  | "promptchain"
  | "multishot"
  | "cot"
  | "tot"
  | "tdd"
  | "metaprompt"
  | "modular"
  | "socratic"
  | "constraint"
  | "vibe";

export interface StrategyDefinition {
  id: PromptStrategyType;
  label: string;
  badge: string;
  category: "Foundational" | "Reasoning" | "Methodology" | "Quality & Security";
  description: string;
  recommendedFor: string;
}

export const STRATEGY_DEFINITIONS: StrategyDefinition[] = [
  {
    id: "oneshot",
    label: "1. One-Shot (Gold Standard)",
    badge: "Recommended",
    category: "Foundational",
    description: "Complete context with clear execution boundaries and high-fidelity reference patterns.",
    recommendedFor: "Bolt.new, Cursor Composer, Windsurf, Claude Code",
  },
  {
    id: "zeroshot",
    label: "2. Zero-Shot (Pure Declarative)",
    badge: "Direct & Fast",
    category: "Foundational",
    description: "Pure declarative contract specifying inputs, outputs, schemas, and non-negotiable constraints.",
    recommendedFor: "v0.dev, Lovable, Create.xyz",
  },
  {
    id: "role",
    label: "3. Role-Based (Staff Architect)",
    badge: "Enterprise",
    category: "Foundational",
    description: "Deep persona instruction embodying a Principal Staff Architect enforcing Stripe/Vercel standards.",
    recommendedFor: "Claude 3.7 Sonnet, ChatGPT 4.5, Cursor Composer",
  },
  {
    id: "promptchain",
    label: "4. Prompt Chaining (5-Phase Sequential)",
    badge: "Multi-Step",
    category: "Methodology",
    description: "Sequential 5-phase execution stopping at verification checkpoints before proceeding.",
    recommendedFor: "Autonomous agents, Cline, Claude Code CLI, Replit",
  },
  {
    id: "multishot",
    label: "5. Multi-Shot (Concrete Examples)",
    badge: "High-Fidelity",
    category: "Foundational",
    description: "Rich examples including input/output pairs, DTO schemas, and production component templates.",
    recommendedFor: "Complex domain apps, Fintech, HealthTech, AI Agents",
  },
  {
    id: "cot",
    label: "6. Chain-of-Thought (Step-by-Step)",
    badge: "Deep Reasoning",
    category: "Reasoning",
    description: "Forces AI to step through data flow, state graphs, and race conditions before writing code.",
    recommendedFor: "o3-mini, DeepSeek-R1, Claude 3.7 Thinking",
  },
  {
    id: "tot",
    label: "7. Tree-of-Thoughts (Trade-Off Analysis)",
    badge: "Comparative",
    category: "Reasoning",
    description: "Evaluates 2-3 architectural approaches (e.g. Server Actions vs REST, SQL vs NoSQL) before coding.",
    recommendedFor: "Architecture decisions, complex backend pipelines",
  },
  {
    id: "tdd",
    label: "8. Test-Driven Development (TDD First)",
    badge: "Rock Solid",
    category: "Methodology",
    description: "Requires writing Jest/Vitest unit and Playwright E2E test assertions before implementation.",
    recommendedFor: "Production enterprise systems, mission-critical logic",
  },
  {
    id: "metaprompt",
    label: "9. Meta-Prompting (Self-Refining)",
    badge: "Self-Auditing",
    category: "Quality & Security",
    description: "Prompts the model to draft, critique against code review rules, and output the polished version.",
    recommendedFor: "Refactoring legacy code, bug-free scaffolding",
  },
  {
    id: "modular",
    label: "10. Modular Decoupled (Hexagonal)",
    badge: "Clean Arch",
    category: "Methodology",
    description: "Strict separation of Domain Entities, Service Ports, UI Adapters, and Infrastructure drivers.",
    recommendedFor: "Microservices, scalable SaaS, multi-tenant apps",
  },
  {
    id: "socratic",
    label: "11. Socratic Discovery (Assumption Check)",
    badge: "Discovery",
    category: "Reasoning",
    description: "Identifies hidden assumptions, ambiguity in user stories, and asks clarifying validations first.",
    recommendedFor: "Underspecified requirements, complex domain discovery",
  },
  {
    id: "constraint",
    label: "12. Constraint-Hardened (OWASP Security)",
    badge: "Zero-Trust",
    category: "Quality & Security",
    description: "Strict enforcement of OWASP Top 10, rate limiting, RS256 JWT, input sanitization, and CORS whitelist.",
    recommendedFor: "Financial, medical, authentication, and payment workflows",
  },
  {
    id: "vibe",
    label: "13. Vibe & Motion Polish (Delight UX)",
    badge: "Award-Winning",
    category: "Quality & Security",
    description: "Focuses intensely on 60fps Framer Motion springs, dark cyber glow, tactile feedback, and slick sound.",
    recommendedFor: "Landing pages, consumer apps, web3 dashboards",
  },
];

export interface VibePlatformLink {
  id: string;
  name: string;
  tagline: string;
  urlTemplate: (prompt: string, title: string) => string;
  gradient: string;
  badge: string;
  popularWith: string;
}

export const VIBE_PLATFORMS: VibePlatformLink[] = [
  {
    id: "cursor",
    name: "Cursor Composer",
    tagline: "AI-first Code Editor with multi-file Agent Composer & .cursorrules",
    urlTemplate: (prompt) => `https://cursor.com/?prompt=${encodeURIComponent(prompt)}`,
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    badge: "Multi-File Composer",
    popularWith: "Full-stack codebases, Next.js, FastAPI, refactoring",
  },
  {
    id: "windsurf",
    name: "Windsurf (Codeium)",
    tagline: "Next-gen Flow paradigm with deep codebase context and Cascade agent",
    urlTemplate: (prompt) => `https://codeium.com/windsurf?prompt=${encodeURIComponent(prompt)}`,
    gradient: "from-teal-500 via-emerald-500 to-cyan-600",
    badge: "Cascade Flow Agent",
    popularWith: "Terminal execution, real-time context streaming",
  },
  {
    id: "claude_code",
    name: "Claude Code CLI",
    tagline: "Anthropic's autonomous terminal coding tool powered by Claude 3.7 Sonnet",
    urlTemplate: (prompt) => `https://claude.ai/code?prompt=${encodeURIComponent(prompt)}`,
    gradient: "from-amber-600 via-orange-600 to-red-600",
    badge: "Autonomous CLI Agent",
    popularWith: "Test-driven development, git operations, large monorepos",
  },
  {
    id: "lovable",
    name: "Lovable.dev",
    tagline: "Full-Stack GPT-4o / Claude 3.7 builder with Supabase & GitHub sync",
    urlTemplate: (prompt) => `https://lovable.dev/?prompt=${encodeURIComponent(prompt)}`,
    gradient: "from-pink-500 via-rose-500 to-red-500",
    badge: "Full-Stack + Supabase",
    popularWith: "SaaS prototypes, web apps, mobile-responsive tools",
  },
  {
    id: "bolt",
    name: "Bolt.new",
    tagline: "In-browser WebContainer running live Node.js, Vite & Next.js SPAs",
    urlTemplate: (prompt) => `https://bolt.new/?prompt=${encodeURIComponent(prompt)}`,
    gradient: "from-cyan-500 via-teal-500 to-blue-600",
    badge: "In-Browser Dev Server",
    popularWith: "Interactive React/Next.js apps & backend APIs",
  },
  {
    id: "v0",
    name: "v0.dev by Vercel",
    tagline: "Generative UI engine producing production React, Tailwind CSS & shadcn/ui",
    urlTemplate: (prompt) => `https://v0.dev/chat?q=${encodeURIComponent(prompt)}`,
    gradient: "from-slate-700 via-slate-800 to-black",
    badge: "Tailwind & shadcn/ui",
    popularWith: "Component libraries, landing pages, sleek dashboards",
  },
  {
    id: "copilot",
    name: "GitHub Copilot Workspace",
    tagline: "Task-centric development environment turning issues and specs into pull requests",
    urlTemplate: (prompt) => `https://github.com/copilot?prompt=${encodeURIComponent(prompt)}`,
    gradient: "from-blue-500 via-purple-600 to-violet-700",
    badge: "PR & Repo Automation",
    popularWith: "GitHub repositories, team workflows, CI/CD pipelines",
  },
  {
    id: "replit",
    name: "Replit Agent",
    tagline: "Autonomous cloud agent provisioning servers, databases, and deployment pipelines",
    urlTemplate: (prompt) => `https://replit.com/new?prompt=${encodeURIComponent(prompt)}`,
    gradient: "from-amber-500 via-orange-500 to-red-600",
    badge: "Autonomous Cloud Agent",
    popularWith: "Multi-file repos, PostgreSQL, Python FastAPI / Node",
  },
  {
    id: "aider",
    name: "Aider CLI",
    tagline: "Git-paired AI terminal assistant with automatic semantic commits",
    urlTemplate: (prompt) => `https://aider.chat/?prompt=${encodeURIComponent(prompt)}`,
    gradient: "from-emerald-600 via-green-600 to-teal-700",
    badge: "Git-Paired Assistant",
    popularWith: "Local development, terminal pairing, clean commits",
  },
];

export interface GeneratedVibePrompt {
  id: string;
  title: string;
  target: string;
  strategy: PromptStrategyType;
  content: string;
}

export function generateVibePromptsForStrategy(
  strategy: PromptStrategyType,
  projectTitle: string,
  userPrompt: string,
  artifacts?: {
    prd?: string;
    schema?: string;
    api?: string;
  }
): GeneratedVibePrompt[] {
  const brief = userPrompt.trim() || projectTitle;
  const cleanTitle = projectTitle.trim() || "Cloud Enterprise Platform";
  const { primaryEntity, secondaryEntity, domainApiSlug } = detectDomainEntities(brief, cleanTitle);

  switch (strategy) {
    case "zeroshot":
      return [
        {
          id: "vibe_01",
          title: `Zero-Shot Frontend Blueprint: ${cleanTitle}`,
          target: "v0.dev / Lovable",
          strategy: "zeroshot",
          content: sanitizeAndFormatMarkdown(`SPECIFICATION: Build the production frontend for "${cleanTitle}".

REQUIREMENTS:
- Core Purpose: ${brief}
- Tech Stack: Next.js 15 App Router, React 19, Tailwind CSS v4, Lucide React icons.
- Screens to build:
  1. Main Dashboard / Operational HUD with interactive state and instant optimistic feedback for ${primaryEntity}s.
  2. Creation modal for ${primaryEntity} with rich validation and progress indicator.
  3. Detail Drawer / View displaying recent ${secondaryEntity} records and telemetry percentiles.
- UI Theme: Ultra-dark cybernetic (#0B0F17 background, #131924 cards with #1E293B borders, cyan-blue gradients).
- Zero placeholder mockups: Wire fully working state hooks, clean responsive layouts, and accessible keyboard navigation.`),
        },
        {
          id: "vibe_02",
          title: `Zero-Shot Backend & DB Schema: ${cleanTitle}`,
          target: "Claude Code / Cursor",
          strategy: "zeroshot",
          content: sanitizeAndFormatMarkdown(`SPECIFICATION: Build backend API and persistence layer for "${cleanTitle}".

REQUIREMENTS:
- Domain Brief: ${brief}
- Runtime: Python FastAPI 0.110+ with strict Pydantic v2 schemas and async/await handlers.
- Database: PostgreSQL 16 relational DDL + DynamoDB Single-Table schema (PK: TENANT#<id>, SK: ${primaryEntity.toUpperCase()}#<id>).
- Endpoints:
  - GET /api/${domainApiSlug} (paginated list with filter query params)
  - POST /api/${domainApiSlug} (create ${primaryEntity} with validation)
  - GET /api/${domainApiSlug}/{id} (retrieve single ${primaryEntity} and recent ${secondaryEntity}s)
  - POST /api/${domainApiSlug}/{id}/action (perform state transition)
- Security: Bearer RS256 JWT validation, CORS origin whitelist, strict input sanitization.`),
        },
        {
          id: "vibe_03",
          title: `Zero-Shot End-to-End Delivery: ${cleanTitle}`,
          target: "Bolt.new / Replit",
          strategy: "zeroshot",
          content: sanitizeAndFormatMarkdown(`SPECIFICATION: Full-stack integration for "${cleanTitle}".

REQUIREMENTS:
- Connect Next.js client to backend endpoints via Axios with Bearer token interceptor.
- Implement real-time progress stream via Server-Sent Events (/api/${domainApiSlug}/stream).
- Deploy configuration for Vercel (frontend) and Render/AWS (backend).
- Include comprehensive end-to-end smoke test validating the primary user journey for "${brief}".`),
        },
      ];

    case "role":
      return [
        {
          id: "vibe_01",
          title: `Staff Frontend Architect Persona: ${cleanTitle}`,
          target: "Cursor Composer / Claude 3.7",
          strategy: "role",
          content: sanitizeAndFormatMarkdown(`You are a Principal Frontend Architect at Stripe and Vercel. You are tasked with delivering the user interface for: "${cleanTitle}".
Brief: "${brief}"

ARCHITECTURAL PRINCIPLES:
1. Zero-Jank UI: Implement smooth 60fps micro-animations, optimistic state transitions for ${primaryEntity} mutations, and responsive fluid typography.
2. State Architecture: Decompose state into custom modular hooks (e.g. use${primaryEntity}Store, use${secondaryEntity}Stream) with SWR/TanStack Query caching.
3. Component Hierarchy:
   - Layout: Collapsible responsive sidebar, top breadcrumbs with status badges, and main viewport.
   - Core Action Canvas: Primary interaction for ${cleanTitle} with immediate tactile feedback.
   - Resilient Error Boundaries: Graceful fallback cards on network or validation errors.
4. Styling: Tailwind CSS cybernetic palette (#0B0F17, #131924, cyan/blue highlights).

Produce complete, production-ready React component code without omitting boilerplate or using placeholders.`),
        },
        {
          id: "vibe_02",
          title: `Principal Cloud & Distributed Systems Lead: ${cleanTitle}`,
          target: "Claude Code / Cursor",
          strategy: "role",
          content: sanitizeAndFormatMarkdown(`You are a Senior Principal Distributed Systems Engineer at AWS. Design and write the backend engine for: "${cleanTitle}".
Brief: "${brief}"

MANDATORY SPECIFICATIONS:
1. Single-Table DynamoDB Architecture:
   - Partition Key: TENANT#<tenantId>
   - Sort Key: ${primaryEntity.toUpperCase()}#<${primaryEntity.toLowerCase()}Id>
   - GSI1 for chronological querying (GSI1PK: STATUS#<status>, GSI1SK: TIMESTAMP#<iso>)
2. API Gateway & Fast Engine:
   - FastAPI server with async/await handlers and sub-50ms execution overhead.
   - JWT validation against RS256 JWKS endpoint.
3. Resilient Error Handling:
   - Exponential backoff retry on AWS DynamoDB throttles.
   - Structured JSON logging with trace IDs.

Write the complete FastAPI router for \`/api/${domainApiSlug}\` and DynamoDB persistence service.`),
        },
        {
          id: "vibe_03",
          title: `Full-Stack Release Commander: ${cleanTitle}`,
          target: "Bolt.new / Windsurf",
          strategy: "role",
          content: sanitizeAndFormatMarkdown(`You are the Lead Release Commander responsible for the zero-downtime launch of: "${cleanTitle}".
Brief: "${brief}"

EXECUTION PROTOCOL:
1. Wire frontend client hooks directly to backend routes at \`/api/${domainApiSlug}\`.
2. Provide Dockerfile and render.yaml infrastructure-as-code configuration.
3. Add health-check watchdog polling GET /api/health every 10 seconds.
4. Verify end-to-end: User signs in -> creates ${primaryEntity} -> receives real-time streamed ${secondaryEntity} updates -> exports verified deliverables.`),
        },
      ];

    case "promptchain":
      return [
        {
          id: "vibe_01",
          title: `Phase 1: Project Scaffold & Domain Types (${cleanTitle})`,
          target: "Claude Code / Cursor",
          strategy: "promptchain",
          content: sanitizeAndFormatMarkdown(`[PHASE 1 of 5: FOUNDATIONS & TYPES]
Project: "${cleanTitle}" - "${brief}"

TASKS:
1. Initialize Next.js 15 App Router workspace with Tailwind CSS v4 and Lucide React.
2. Define TypeScript types for all domain models: ${primaryEntity}, ${secondaryEntity}, TenantAccount, OperationalStatusEnum.
3. Create client API service client in src/services/api.ts with Axios and Bearer token interceptor.
4. Create global theme provider and cybernetic design tokens.

STOP after Phase 1 and verify all type declarations pass compile checks before moving to Phase 2.`),
        },
        {
          id: "vibe_02",
          title: `Phase 2: Database Schema & REST Route Handlers (${cleanTitle})`,
          target: "Claude Code / Cursor",
          strategy: "promptchain",
          content: sanitizeAndFormatMarkdown(`[PHASE 2 of 5: BACKEND & STORAGE]
Project: "${cleanTitle}" - "${brief}"

TASKS:
1. Implement the database persistence layer (Single-Table DynamoDB schema and PostgreSQL 16 schema).
2. Write CRUD service methods with automated partition key and sort key formatting for ${primaryEntity}s.
3. Write FastAPI route handlers for /api/${domainApiSlug} list, create, detail, update, and action triggers.
4. Add automated unit test stubs asserting 200 OK responses with mock payloads.

STOP after Phase 2 and confirm all endpoint schemas match API specifications.`),
        },
        {
          id: "vibe_03",
          title: `Phase 3, 4 & 5: Interactive UI, Real-Time Streams & Polish (${cleanTitle})`,
          target: "Bolt.new / Cursor",
          strategy: "promptchain",
          content: sanitizeAndFormatMarkdown(`[PHASE 3, 4 & 5: INTERACTION, STREAMING & LAUNCH]
Project: "${cleanTitle}" - "${brief}"

TASKS:
1. Build the primary user interface: responsive views, drag/click interactions, and modals for ${primaryEntity}s.
2. Wire real-time Server-Sent Events (SSE) streaming to render dynamic ${secondaryEntity} events.
3. Implement 15-minute inactivity session watchdog and secure cookie persistence.
4. Add one-click export and download triggers for all generated deliverables (.md, .docx, .pdf, .zip).
5. Verify build compiles cleanly with zero TypeScript errors.`),
        },
      ];

    case "multishot":
      return [
        {
          id: "vibe_01",
          title: `Multi-Shot Frontend Components & Hooks: ${cleanTitle}`,
          target: "Cursor / Windsurf",
          strategy: "multishot",
          content: sanitizeAndFormatMarkdown(`Build the frontend for "${cleanTitle}" (${brief}).

EXAMPLE PATTERN (Custom Hook with Optimistic Updates):
\`\`\`tsx
export function use${primaryEntity}Store() {
  const [entities, setEntities] = useState<${primaryEntity}[]>([]);
  const [loading, setLoading] = useState(false);

  const create${primaryEntity} = async (newPayload: ${primaryEntity}Input) => {
    const tempId = "temp_" + Date.now();
    setEntities((prev) => [{ ...newPayload, ${primaryEntity.toLowerCase()}Id: tempId, pending: true }, ...prev]);
    try {
      const res = await api.post("/api/${domainApiSlug}", newPayload);
      setEntities((prev) => prev.map((e) => e.${primaryEntity.toLowerCase()}Id === tempId ? res.data : e));
    } catch (err) {
      setEntities((prev) => prev.filter((e) => e.${primaryEntity.toLowerCase()}Id !== tempId));
      throw err;
    }
  };

  return { entities, create${primaryEntity}, loading };
}
\`\`\`

TASK: Use the pattern above to build the complete, responsive UI for "${cleanTitle}".`),
        },
        {
          id: "vibe_02",
          title: `Multi-Shot DynamoDB & Endpoint Contracts: ${cleanTitle}`,
          target: "Claude Code / Cursor",
          strategy: "multishot",
          content: sanitizeAndFormatMarkdown(`Implement the backend API and Single-Table DynamoDB engine for "${cleanTitle}" (${brief}).

EXAMPLE RECORD (DynamoDB Single-Table):
\`\`\`json
{
  "PK": "TENANT#tenant_enterprise_01",
  "SK": "${primaryEntity.toUpperCase()}#a0000000-0000-0000-0000-000000000001",
  "type": "${primaryEntity.toUpperCase()}",
  "displayName": "Production ${primaryEntity} Node",
  "operationalStatus": "ACTIVE",
  "createdAt": "${new Date().toISOString()}",
  "configurationPayload": { "telemetryIntervalMs": 1000 }
}
\`\`\`

TASK: Implement all endpoints and database methods for "${cleanTitle}" following these exact patterns.`),
        },
        {
          id: "vibe_03",
          title: `Multi-Shot Cloud Deployment & Integration: ${cleanTitle}`,
          target: "Bolt.new / Lovable",
          strategy: "multishot",
          content: sanitizeAndFormatMarkdown(`Deploy and wire the complete stack for "${cleanTitle}".
Configure full-stack integration, proxy rules, and environment variables to launch "${cleanTitle}".`),
        },
      ];

    case "cot":
      return [
        {
          id: "vibe_01",
          title: `Chain-of-Thought Architectural Derivation: ${cleanTitle}`,
          target: "Claude 3.7 / o3-mini / Cursor",
          strategy: "cot",
          content: sanitizeAndFormatMarkdown(`THINK STEP-BY-STEP before writing a single line of code for "${cleanTitle}".

STEP 1: REASONING THROUGH REQUIREMENTS
- Deconstruct the brief: "${brief}".
- What are the core stateful entities? (${primaryEntity}, ${secondaryEntity}). What are the mutations? What are the side effects?
- What are the race conditions (e.g. concurrent updates, double submits)?

STEP 2: DERIVING THE COMPONENT & DATA GRAPH
- Explicitly trace data flow: User action -> optimistic client update -> API gateway request -> DB mutation -> background event emit -> downstream client listener.

STEP 3: CODE IMPLEMENTATION
- Now write the complete Next.js / React implementation that guarantees adherence to the reasoning deduced in Steps 1 & 2.`),
        },
        {
          id: "vibe_02",
          title: `Chain-of-Thought Resilient Backend Engine: ${cleanTitle}`,
          target: "Cursor / Claude Code",
          strategy: "cot",
          content: sanitizeAndFormatMarkdown(`THINK STEP-BY-STEP through backend resilience for "${cleanTitle}".
1. Reason through database query access patterns: What partition key enables single-query retrieval of ${primaryEntity}s and recent ${secondaryEntity}s?
2. Reason through auth boundaries: How do we validate RS256 JWT tokens without external network overhead?
3. Reason through error propagation: Map HTTP 400, 401, 403, 404, 429, and 500 error responses with standardized RFC 7807 Problem Details.
4. Output the complete FastAPI / Express codebase fulfilling this logical chain.`),
        },
      ];

    case "tot":
      return [
        {
          id: "vibe_01",
          title: `Tree-of-Thoughts Architecture Exploration: ${cleanTitle}`,
          target: "Cursor / Claude 3.7",
          strategy: "tot",
          content: sanitizeAndFormatMarkdown(`Explore 3 distinct architectural branches for implementing "${cleanTitle}" (${brief}):

BRANCH A (Pure Client SPA with Edge Functions):
- Pros/Cons regarding latency, offline capabilities, and bundle size.

BRANCH B (Hybrid Next.js App Router with Server Components):
- Pros/Cons regarding streaming hydration, SEO, and database connection pooling.

BRANCH C (Decoupled Vite SPA + Independent FastAPI Gateway):
- Pros/Cons regarding independent scaling, deployment flexibility, and testing velocity.

SELECTION & SYNTHESIS:
- Select the superior branch for "${cleanTitle}" based on real-world maintenance and speed.
- Write the complete code implementing the winning branch for ${primaryEntity} workflows.`),
        },
      ];

    case "tdd":
      return [
        {
          id: "vibe_01",
          title: `TDD Suite First: Unit & Integration Tests (${cleanTitle})`,
          target: "Cursor / Windsurf / Claude Code",
          strategy: "tdd",
          content: sanitizeAndFormatMarkdown(`PRACTICE STRICT TEST-DRIVEN DEVELOPMENT (RED -> GREEN -> REFACTOR) for "${cleanTitle}".

STEP 1 (RED): Write the test suites in Vitest and Playwright:
- Test 1: User authentication and token persistence.
- Test 2: Core domain entity creation (${primaryEntity}) and schema validation errors.
- Test 3: Optimistic state mutation and rollback on HTTP 500 error.
- Test 4: Full project lifecycle from input to export.

STEP 2 (GREEN): Write the minimum, cleanest production React & FastAPI code required to make 100% of these test assertions pass.

STEP 3 (REFACTOR): Clean up abstractions, add TypeScript strict types, and optimize rendering cycles.`),
        },
      ];

    case "metaprompt":
      return [
        {
          id: "vibe_01",
          title: `Meta-Prompting Self-Refining Code Pipeline: ${cleanTitle}`,
          target: "Claude 3.7 / Cursor Composer",
          strategy: "metaprompt",
          content: sanitizeAndFormatMarkdown(`You will act as both Developer and Senior Staff Code Reviewer for "${cleanTitle}".

STAGE 1: GENERATE INITIAL CANDIDATE CODE
- Build the core features specified in: "${brief}".

STAGE 2: CRITICAL SELF-AUDIT
- Check against:
  - Memory leaks in useEffect / event listeners.
  - Unhandled promise rejections or missing try/catch blocks.
  - Accessibility (ARIA roles, keyboard focus traps, contrast ratios).
  - Strict absence of generic placeholder tokens.

STAGE 3: REFINED MASTER PRODUCTION CODE
- Incorporate all feedback from Stage 2 and output the finalized, flawless code.`),
        },
      ];

    case "modular":
      return [
        {
          id: "vibe_01",
          title: `Hexagonal / Clean Architecture Layering: ${cleanTitle}`,
          target: "Cursor / Claude Code",
          strategy: "modular",
          content: sanitizeAndFormatMarkdown(`Build "${cleanTitle}" using strictly decoupled Hexagonal Architecture:

1. DOMAIN LAYER (Zero external dependencies):
   - Pure TypeScript entity interfaces for ${primaryEntity} and ${secondaryEntity} and business validation logic.
2. APPLICATION LAYER (Use Cases):
   - Command/Query handlers (e.g. Create${primaryEntity}UseCase, Get${secondaryEntity}StreamUseCase).
3. ADAPTERS LAYER (UI & API):
   - React UI Presentation components (Tailwind CSS, Lucide React).
   - FastAPI route controllers and DTO serializers.
4. INFRASTRUCTURE LAYER:
   - DynamoDB client, Cognito auth verifier, and HTTP fetcher.

Output each layer in dedicated, self-contained files.`),
        },
      ];

    case "socratic":
      return [
        {
          id: "vibe_01",
          title: `Socratic Requirement Hardening: ${cleanTitle}`,
          target: "Claude 3.7 / ChatGPT 4.5",
          strategy: "socratic",
          content: sanitizeAndFormatMarkdown(`Before implementing "${cleanTitle}" (${brief}), interrogate the requirements with Socratic rigor:

1. What implicit assumptions exist about user roles, data volumes, or network latency?
2. What happens if third-party services fail or return unexpected payloads during ${primaryEntity} processing?
3. What is the degradation strategy when the user is offline or experiencing high packet loss?

Answer each question concisely, state the chosen technical mitigation, and then implement the complete, resilient application.`),
        },
      ];

    case "constraint":
      return [
        {
          id: "vibe_01",
          title: `Constraint-Hardened OWASP Security Blueprint: ${cleanTitle}`,
          target: "Claude Code / Cursor",
          strategy: "constraint",
          content: sanitizeAndFormatMarkdown(`Build "${cleanTitle}" with ZERO-TRUST and DEFENSIVE PROGRAMMING:

MANDATORY SECURITY CONSTRAINTS:
1. Input Sanitization: Validate and sanitize 100% of user inputs with Zod / Pydantic schemas for \`/api/${domainApiSlug}\`. Strip dangerous HTML/scripts.
2. Authentication & Authorization: Require Bearer RS256 JWT tokens. Enforce tenant isolation (Users cannot query other tenants' entities).
3. Rate Limiting & DoS Protection: Implement sliding-window rate limiting on all mutating endpoints.
4. Content Security Policy (CSP): Configure strict HTTP headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
5. Error Masking: Never leak database stack traces or internal credentials in client-facing HTTP responses.

Output the complete, hardened application.`),
        },
      ];

    case "vibe":
      return [
        {
          id: "vibe_01",
          title: `Award-Winning Vibe, Motion & Micro-Interactions: ${cleanTitle}`,
          target: "v0.dev / Lovable / Bolt.new",
          strategy: "vibe",
          content: sanitizeAndFormatMarkdown(`Build an AWARD-WINNING, hyper-polished user interface for "${cleanTitle}" (${brief}):

VISUAL & MOTION REQUIREMENTS:
- Cybernetic Neo-Dark Theme: #0B0F17 deep void canvas, elevated #131924 cards with subtle #1E293B border glow and electric cyan/blue neon accents (#06B6D4 to #3B82F6).
- Motion & Micro-Interactions: Smooth hover scaling (1.02x), spring-physics drawer animations, pulse glows on active agent tasks, and instant optimistic button state feedback for ${primaryEntity} actions.
- Typography: High-contrast legible sans paired with clean monospace labels for metrics and identifiers.
- Sound & Tactile: Responsive visual feedback triggers on key operations (copy, export, build).
- Mobile Perfection: Zero horizontal overflow, touch-friendly tap targets (minimum 44px), and fluid flexbox grids.`),
        },
      ];

    case "oneshot":
    default:
      return [
        {
          id: "vibe_01",
          title: `Vibe Prompt #1: Next.js Frontend Core & UI Experience for ${cleanTitle}`,
          target: "Frontend Architect / Cursor",
          strategy: "oneshot",
          content: sanitizeAndFormatMarkdown(`Build the production frontend application for '${cleanTitle}'.

Original Project Brief:
"${brief}"

Frontend Requirements:
- Build responsive, modern screens using Next.js App Router and Tailwind CSS.
- Implement the interactive user flows: screen transitions, modals, user inputs, and live feedback for ${primaryEntity}s.
- Use Lucide React icons for clean, modern iconography.
- Set up a clean state management layer with custom React hooks.
- Configure an Axios API service layer with request/response interceptors and error boundaries.
- Theme: Ultra-dark cybernetic (#0B0F17 background, #131924 cards with #1E293B borders, cyan-to-blue linear gradients #06B6D4 to #3B82F6).`),
        },
        {
          id: "vibe_02",
          title: `Vibe Prompt #2: Backend Services, PostgreSQL DDL & OpenAPI for ${cleanTitle}`,
          target: "Backend Architect / Claude Code",
          strategy: "oneshot",
          content: sanitizeAndFormatMarkdown(`Build the production backend API service and database persistence for '${cleanTitle}'.

Original Project Brief:
"${brief}"

Backend Requirements:
- Implement REST API endpoints at \`/api/${domainApiSlug}\` with Pydantic request validation schemas.
- Implement the PostgreSQL 16 DDL schema and DynamoDB persistence for ${primaryEntity}s and ${secondaryEntity}s.
- Provide authentication middleware (Cognito / JWT), CORS whitelist, and robust error handling.
- Include a health check route GET /api/health and comprehensive test stubs.`),
        },
        {
          id: "vibe_03",
          title: `Vibe Prompt #3: Full-Stack Integration & Cloud Deployment for ${cleanTitle}`,
          target: "Full Stack Integrator / Bolt.new",
          strategy: "oneshot",
          content: sanitizeAndFormatMarkdown(`Wire end-to-end integration and cloud deployment for '${cleanTitle}'.

Original Project Brief:
"${brief}"

Integration & Cloud Tasks:
- Connect the frontend client to the backend endpoints at \`/api/${domainApiSlug}\` with real-time UI updates.
- Set up cloud object storage for any file/media uploads required by the application.
- Configure environment variables and deployment scripts for production hosting (Netlify frontend, Render/AWS backend).
- Verify end-to-end user journeys from onboarding through core actions.`),
        },
      ];
  }
}
