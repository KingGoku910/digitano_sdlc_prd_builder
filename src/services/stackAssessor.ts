/**
 * Dynamic Stack Assessor
 * Analyzes project brief requirements, domain complexity, and architectural preferences
 * to intelligently infer optimal frontend, UI libraries, backend runtimes, database presets,
 * and AI models without forcing rigid hardcoded defaults.
 */

import {
  PlatformType,
  AgentModeType,
  ProjectSpecificationInputs,
  PLATFORM_FRONTEND_OPTIONS,
  PLATFORM_UI_OPTIONS,
  PLATFORM_BACKEND_OPTIONS,
} from "../types/projectSpec";

export interface AssessedStackResult {
  projectType: PlatformType;
  frontend: string;
  uiStyling: string[];
  backend: string;
  database: string[];
  databasePreset: string;
  models: string[];
  agentMode: AgentModeType;
  detectedTitle?: string;
  inferredReason: string;
  detectedEntities: string[];
  confidenceScore: number; // 0-100
}

export function assessDynamicStack(
  promptText: string,
  preferredType?: PlatformType
): AssessedStackResult {
  const text = promptText.trim();
  const lower = text.toLowerCase();

  // 1. Detect Title if present in quotes or standard patterns
  let detectedTitle: string | undefined;
  const quoteMatch = text.match(/Build ["“']([^"”']+)["”']/i) || text.match(/["“']([a-zA-Z0-9\s-]+?)["”']/i);
  if (quoteMatch && quoteMatch[1] && quoteMatch[1].length < 40) {
    detectedTitle = quoteMatch[1].trim();
  }

  // 2. Assess Platform / Project Type
  let projectType: PlatformType = preferredType || "Web App";
  if (!preferredType || preferredType === "Web App") {
    if (
      /\b(mobile app|mobile application|react native|expo|flutter|ios app|android app|swift|kotlin|patient portal app)\b/i.test(
        lower
      )
    ) {
      projectType = "Mobile App";
    } else if (/\b(desktop app|desktop application|electron|tauri|macos app|windows app)\b/i.test(lower)) {
      projectType = "Desktop App";
    }
  }

  // 3. Assess Frontend Framework
  let frontend = PLATFORM_FRONTEND_OPTIONS[projectType][0];
  if (projectType === "Web App") {
    if (/next\.?js|app router|next 1|nextjs/i.test(lower)) {
      frontend = "Next.js (App Router)";
    } else if (/vite|react spa|react 1|single-page application/i.test(lower)) {
      frontend = "React (TypeScript + Vite)";
    } else if (/nuxt|vue 3|vuejs/i.test(lower)) {
      frontend = "Vue 3 (Nuxt.js)";
    } else if (/sveltekit|svelte/i.test(lower)) {
      frontend = "SvelteKit";
    } else if (/angular/i.test(lower)) {
      frontend = "Angular 18";
    } else {
      frontend = "Next.js (App Router)";
    }
  } else if (projectType === "Mobile App") {
    if (/flutter|dart/i.test(lower)) {
      frontend = "Flutter 3.x (Dart)";
    } else if (/swift|ios native/i.test(lower)) {
      frontend = "Swift (iOS Native)";
    } else if (/kotlin|compose/i.test(lower)) {
      frontend = "Kotlin / Jetpack Compose (Android)";
    } else {
      frontend = "React Native (Expo SDK 52)";
    }
  } else if (projectType === "Desktop App") {
    if (/tauri|rust/i.test(lower)) {
      frontend = "Tauri (Rust + React)";
    } else {
      frontend = "Electron (React / TypeScript)";
    }
  }

  // 4. Assess UI & Styling Libraries
  const uiStyling: string[] = [];
  if (projectType === "Web App") {
    if (/tailwind/i.test(lower) || !lower.includes("bootstrap")) {
      uiStyling.push("Tailwind CSS v4");
    }
    if (/shadcn/i.test(lower) || /radix/i.test(lower) || uiStyling.includes("Tailwind CSS v4")) {
      uiStyling.push("shadcn/ui");
    }
    if (/tremor|recharts|chart|analytics heatmap|dashboard/i.test(lower)) {
      // Tremor / Recharts analytics companion
      uiStyling.push("Tremor / Recharts");
    }
    if (/mui|material ui/i.test(lower)) {
      uiStyling.length = 0;
      uiStyling.push("Material UI (MUI)");
    }
    if (uiStyling.length === 0) {
      uiStyling.push("Tailwind CSS v4", "shadcn/ui");
    }
  } else if (projectType === "Mobile App") {
    if (/tamagui/i.test(lower)) uiStyling.push("Tamagui");
    if (/nativewind|tailwind/i.test(lower)) uiStyling.push("NativeWind (Tailwind)");
    if (/paper/i.test(lower)) uiStyling.push("React Native Paper");
    if (uiStyling.length === 0) {
      uiStyling.push("Tamagui", "NativeWind (Tailwind)");
    }
  } else {
    uiStyling.push("Tailwind CSS", "shadcn/ui");
  }

  // 5. Assess Backend Runtime
  let backend = PLATFORM_BACKEND_OPTIONS[projectType][0];
  if (/fastapi|python|celery|multimodal vision|ai inference/i.test(lower)) {
    backend = "Python (FastAPI)";
  } else if (/django/i.test(lower)) {
    backend = "Python (Django REST)";
  } else if (/nestjs|nest\.js/i.test(lower)) {
    backend = "Node.js (NestJS)";
  } else if (/express|nodejs|node\.js/i.test(lower)) {
    backend = "Node.js (Express / TypeScript)";
  } else if (/go|golang|gin|fiber/i.test(lower)) {
    backend = "Go (Gin / Fiber)";
  } else if (/spring boot|java/i.test(lower)) {
    backend = "Java (Spring Boot 3)";
  } else if (/c#|\.net|dotnet/i.test(lower)) {
    backend = "C# (.NET 8 Web API)";
  } else if (/actix|axum|rust backend/i.test(lower)) {
    backend = "Rust (Actix-web / Axum)";
  } else {
    // Intelligent default: Python (FastAPI) is ideal for AI-agent pipelines and modern asynchronous tasks
    backend = "Python (FastAPI)";
  }

  // 6. Assess Database & Storage
  let database: string[] = ["PostgreSQL 16", "Redis (In-Memory)"];
  let databasePreset = "postgres_redis";

  if (/firebase|firestore|cloud storage/i.test(lower)) {
    database = ["Firebase Firestore DB", "Firebase Cloud Storage"];
    databasePreset = "firebase_firestore";
    if (/redis|cache/i.test(lower)) {
      database.push("Redis (In-Memory)");
    }
  } else if (/supabase|pgvector|vector store|rag|embeddings/i.test(lower)) {
    database = ["PostgreSQL (Supabase)", "pgvector (Vector Store)", "Redis Caching"];
    databasePreset = "supabase_vector";
  } else if (/dynamodb|dynamo|s3|single-table/i.test(lower)) {
    database = ["Amazon DynamoDB (Single-Table)", "Amazon S3 (Encrypted Storage)"];
    databasePreset = "dynamo_s3";
  } else if (/mongo|mongodb|atlas/i.test(lower)) {
    database = ["MongoDB (Atlas)", "Redis (In-Memory)"];
    databasePreset = "mongo_redis";
  } else if (/qdrant|weaviate/i.test(lower)) {
    database = ["Qdrant Vector DB", "PostgreSQL 16", "Redis Caching"];
    databasePreset = "qdrant_weaviate";
  } else {
    // Standard enterprise relational
    database = ["PostgreSQL 16", "Redis (In-Memory)"];
    databasePreset = "postgres_redis";
  }

  // 7. Assess AI Models & Agent Configuration
  const models: string[] = [];
  if (/claude|sonnet|bedrock|anthropic/i.test(lower)) {
    models.push("anthropic.claude-sonnet-5");
  }
  if (/gemini|google adk/i.test(lower) || models.length === 1) {
    models.push("gemini-3.8-flash");
  }
  if (/gpt-4o|openai|chatgpt/i.test(lower) && models.length < 2) {
    models.unshift("gpt-4o");
  }
  if (/deepseek/i.test(lower) && models.length < 2) {
    models.unshift("deepseek-r1");
  }
  if (models.length === 0) {
    models.push("anthropic.claude-sonnet-5", "gemini-3.8-flash");
  }
  const finalModels = models.slice(0, 2);

  // Agent Mode
  let agentMode: AgentModeType = "Multi-Agent";
  if (/no ai|rule-based only/i.test(lower)) {
    agentMode = "No AI agent";
  } else if (/single agent/i.test(lower)) {
    agentMode = "Single Agent";
  } else {
    agentMode = "Multi-Agent";
  }

  // Detect domain entities
  const detectedEntities: string[] = [];
  const entityKeywords = [
    "outfit",
    "wardrobe",
    "score",
    "ad creative",
    "creative brief",
    "roas",
    "contract",
    "audit",
    "risk",
    "patient",
    "appointment",
    "telemetry",
    "freight",
    "ledger",
    "wallet",
  ];
  for (const kw of entityKeywords) {
    if (lower.includes(kw)) {
      detectedEntities.push(kw);
    }
  }

  // Build human-readable reasoning summary
  const reasonParts: string[] = [];
  if (lower.includes("firebase") || lower.includes("firestore")) {
    reasonParts.push("Firebase Firestore NoSQL & Cloud Storage");
  } else if (databasePreset === "supabase_vector") {
    reasonParts.push("Supabase pgvector Embeddings & PostgreSQL");
  } else {
    reasonParts.push("PostgreSQL 16 & Redis");
  }

  if (/fastapi|python/i.test(lower)) {
    reasonParts.push("Python FastAPI Async Engine");
  } else if (/go|gin/i.test(lower)) {
    reasonParts.push("Go Gin/Fiber Low-Latency Engine");
  }

  if (finalModels.includes("anthropic.claude-sonnet-5") || lower.includes("bedrock")) {
    reasonParts.push("AWS Bedrock Claude with Gemini Failover");
  }

  const inferredReason = reasonParts.length > 0
    ? `Inferred ${reasonParts.join(" + ")} directly from brief requirements & complexity.`
    : `Dynamically optimized for modern ${projectType} architecture.`;

  return {
    projectType,
    frontend,
    uiStyling,
    backend,
    database,
    databasePreset,
    models: finalModels,
    agentMode,
    detectedTitle,
    inferredReason,
    detectedEntities,
    confidenceScore: text.length > 30 ? 95 : 75,
  };
}
