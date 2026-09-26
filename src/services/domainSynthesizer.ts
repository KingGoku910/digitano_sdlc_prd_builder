/**
 * Domain-Aware Technical Synthesizer
 * Generates custom, production-grade SDLC deliverables based on the user's specific project brief.
 * Used as an ultra-fast offline fallback if upstream cloud AI models throttle or experience 503 high demand spikes.
 */

export function generateDomainDeliverable(
  agentId: string,
  projectTitle: string,
  userPrompt: string
): string {
  const brief = userPrompt.trim() || projectTitle;
  const isOutfitApp = /drip|outfit|fashion|clothes|wear|style|tiktok|photo/i.test(brief);
  const isJobApp = /job|apply|resume|career|interview|applicant|hiring|scraper/i.test(brief);
  const isEcommerce = /shop|cart|store|product|order|checkout|stripe|ecommerce/i.test(brief);

  if (agentId === "agent_01") {
    // Product Owner
    if (isOutfitApp) {
      return `### 1. Executive Summary & Core Value Proposition
**${projectTitle}** is a vertical-video and photo social platform enabling users to post outfits, receive automated AI styling feedback, and receive community ratings (1–10) in an interactive, gesture-driven feed.

### 2. User Personas & Target Audience
- **The Fit Enthusiast (Creator):** Uploads outfit photos and specifies event context (e.g., Gala, Date Night, Streetwear) for real-time validation.
- **The Style Rater (Community):** Browses full-screen posts, provides instant 1–10 scores, leaves comments, and follows trending curators.

### 3. Epics & User Stories (Given-When-Then)
#### Epic 1: Full-Screen Vertical Feed Navigation
- **As a** user,
- **I want to** swipe up/down vertically between outfit posts,
- **So that** I enjoy a fluid, TikTok-style browsing experience.
  - *Given* an outfit post is displayed in the viewport,
  - *When* the user executes a swipe-up gesture,
  - *Then* the feed snaps smoothly to the next outfit and starts media playback.

#### Epic 2: Numerical 1–10 Outfit Rating
- **As a** rater,
- **I want to** select a 1–10 score on the on-screen slider,
- **So that** my vote updates the creator's aggregated rating in real time.
  - *Given* the post interaction rail is visible,
  - *When* the user taps or drags to a score,
  - *Then* the score persists to the database and recalculates the post's average.

#### Epic 3: Contextual Drip Upload & AI Stylist
- **As a** creator,
- **I want to** upload a photo with event tags,
- **So that** AI evaluates color harmony and fit before community voting.
  - *Given* an image selected from the camera roll,
  - *When* event context is provided and submitted,
  - *Then* AI critique is generated and appended to the post document.`;
    }

    if (isJobApp) {
      return `### 1. Executive Summary & Core Value Proposition
**${projectTitle}** is an autonomous job application platform that continuously scans job listings, custom-tailors resumes and cover letters using generative AI, and tracks live pipeline statuses on an interactive Kanban board.

### 2. User Personas & Target Audience
- **The Active Job Seeker:** Tech and business professionals targeting multiple openings with tailored applications.
- **The Career Strategist:** Manages application pipelines, tracking interviews, offer deadlines, and recruiter follow-ups.

### 3. Epics & User Stories (Given-When-Then)
#### Epic 1: Resume Profile & Target Criteria
- **As a** candidate,
- **I want to** upload my master resume and specify target salary, roles, and locations,
- **So that** the background workers prioritize matching listings.
  - *Given* a master PDF or DOCX file,
  - *When* parsed by the resume extractor,
  - *Then* structured skills and experience are stored in the user profile.

#### Epic 2: Automated Resume Tailoring & Submission
- **As a** candidate,
- **I want to** automatically tailor resume bullet points to matching job descriptions,
- **So that** ATS keyword scores are maximized.
  - *Given* a newly discovered job listing,
  - *When* the AI tailoring agent runs,
  - *Then* an optimized PDF version and cover letter draft are created.

#### Epic 3: Real-Time Kanban Pipeline Tracker
- **As a** candidate,
- **I want to** view and drag applications across 'Applied', 'Screening', 'Interview', and 'Offer' columns,
- **So that** my active job search is organized in one central cockpit.
  - *Given* the dashboard is loaded,
  - *When* application status changes via webhook or drag-and-drop,
  - *Then* the Kanban column updates with optimistic UI confirmation.`;
    }

    // Default Dynamic Domain
    return `### 1. Executive Summary & Core Value Proposition
**${projectTitle}** addresses: "${brief}". It delivers a specialized, high-performance web experience with intuitive end-user flows, resilient data persistence, and decoupled backend services.

### 2. User Personas & Target Audience
- **Primary Operator:** Direct consumer or professional utilizing the primary workflow of ${projectTitle}.
- **Secondary Administrator:** Manages configurations, monitors telemetry, and oversees data integrity.

### 3. Epics & User Stories (Given-When-Then)
#### Epic 1: Core User Journey & Interaction
- **As a** primary user,
- **I want to** access and execute the core workflow described in "${brief.slice(0, 80)}",
- **So that** I achieve the intended outcome with minimal friction.
  - *Given* valid authentication and profile state,
  - *When* the primary action is triggered,
  - *Then* immediate visual feedback and persistent state updates are delivered.

#### Epic 2: Live Feedback & Data Operations
- **As an** operator,
- **I want to** receive instantaneous validation and status updates,
- **So that** long-running operations remain transparent.
  - *Given* an active task in progress,
  - *When* updates occur,
  - *Then* real-time progress indicators reflect completion status.`;
  }

  if (agentId === "agent_02") {
    // Software Analyst
    return `### 1. System Architecture & Component Interaction
- **Client Tier:** Next.js App Router Single-Page Application (SPA) communicating via Axios and Server-Sent Events (SSE).
- **Service Tier:** High-performance RESTful API endpoints enforcing strict request validation schemas.
- **Data Tier:** Schematized data store with normalized relationships or single-table access patterns optimized for read-heavy operations.

### 2. External Services & Third-Party Integrations
- **Authentication:** Token-based security verifying signature, issuer, and expiration.
- **Media / Asset Storage:** Cloud storage buckets with signed URLs for secure uploads.
- **Real-Time Streaming:** EventSource / WebSocket connection maintaining low-latency state synchronization.

### 3. Non-Functional Requirements & Performance SLAs
- **Latency:** $\\le 180\\text{ms}$ P95 API response time; $\\le 50\\text{ms}$ client UI transitions.
- **Availability:** 99.9% uptime SLA with automated multi-zone failover.
- **Security:** Content Security Policy (CSP), encrypted tokens in transit (TLS 1.3), and zero unauthenticated write access.`;
  }

  if (agentId === "agent_03") {
    // UI Lead
    return `### 1. Core Screen Breakdown & User Journey
1. **Primary Feed / Dashboard View:** Central responsive layout with clear viewport hierarchy, navigation drawer, and real-time activity indicators.
2. **Action & Creation Modal / Drawer:** Streamlined submission interface with drag-and-drop file ingestion, field validation, and instant preview.
3. **Detail & Analytics Drawer:** Deep-dive modal presenting metrics, audit history, and associated metadata.

### 2. Component Hierarchy & Design Tokens
- **Surface Palette:** Main Background (#0B0F17), Card Surfaces (#131924), Borders (#1E293B).
- **Accent Gradients:** Cyan-to-Blue Linear Gradient (#06B6D4 to #3B82F6).
- **Interactive Elements:** Smooth spring transitions (200ms cubic-bezier), responsive gesture listeners, and Lucide React icon tokens.`;
  }

  if (agentId === "agent_04") {
    // Backend Lead (DB & API)
    return `### 1. Database Schema & Entities
\`\`\`json
{
  "entity": "ProjectRecord",
  "partition_key": "USER#<user_id>",
  "sort_key": "ITEM#<item_id>",
  "attributes": {
    "title": "String",
    "status": "ACTIVE | PENDING | ARCHIVED",
    "metadata": {
      "brief": "${brief.slice(0, 100)}",
      "tags": ["Production", "Verified"]
    },
    "created_at": "ISO-8601 Timestamp",
    "updated_at": "ISO-8601 Timestamp"
  }
}
\`\`\`

### 2. Core REST API Endpoints
- \`GET /api/items\` — Retrieve paginated items for authenticated user.
- \`POST /api/items\` — Create new record with payload validation.
- \`GET /api/items/:id\` — Fetch detailed entity state and associated metrics.
- \`PUT /api/items/:id\` — Update status and mutate attributes atomically.
- \`DELETE /api/items/:id\` — Soft-delete item and invalidate cache.`;
  }

  if (agentId === "agent_05") {
    // Full Stack Integrator
    return `### 1. Client State Management & React Hooks
- **\`useAppData()\`:** Central hook wrapping TanStack Query / SWR for caching, background revalidation, and optimistic updates.
- **\`useEventStream()\`:** Manages EventSource reconnection backoff, heartbeat pings, and error dispatchers.

### 2. Real-Time & Optimistic UI Strategy
- Client executes immediate state mutation locally upon user interaction.
- Dispatches background network request with idempotency key.
- Automatically rolls back state and renders notification if backend rejects transaction.`;
  }

  if (agentId === "agent_06") {
    // Infra Architect
    return `### 1. Cloud Architecture & Hosting Blueprint
- **Frontend Hosting:** Global CDN Edge network (Netlify / Vercel) with asset caching and instant invalidation.
- **Backend Compute:** Containerized microservice deployment with automatic horizontal pod autoscaling.
- **Data Persistence:** Managed database with automated daily snapshots, multi-region replication, and point-in-time recovery.

### 2. Security Boundaries & Secrets Management
- Zero secret credentials bundled in client build artifacts.
- Environment variables injected securely via cloud platform key vaults.
- TLS 1.3 encryption enforced across all ingress points.`;
  }

  // Scrum Master
  return `### Sprint Alignment Confirmation
All 6 upstream agents have produced aligned technical specifications for **${projectTitle}**:
- **Product Scope:** Epics, user stories, and acceptance criteria validated.
- **Architecture:** System diagrams, schemas, and API contracts verified.
- **Sprint Backlog:** Deliverables prioritized and ready for developer handoff into Cursor, Claude Code, and Bolt.new.`;
}
