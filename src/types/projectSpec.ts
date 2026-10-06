/**
 * Project Specification Types
 * Encapsulates the user's detailed architectural choices and stack configuration.
 */

export type PlatformType = "Web App" | "Mobile App" | "Desktop App";

export type AgentModeType = "No AI agent" | "Single Agent" | "Multi-Agent";

export interface ProjectSpecificationInputs {
  projectName: string;
  projectType: PlatformType;
  frontend: string;
  uiStyling: string[];
  backend: string;
  database: string[];
  databasePreset: string;
  aiIntegration: {
    models: string[]; // max 2: Primary and Secondary
    agentMode: AgentModeType;
  };
  description: string;
}

export const PLATFORM_FRONTEND_OPTIONS: Record<PlatformType, string[]> = {
  "Web App": [
    "Next.js (App Router)",
    "React (TypeScript + Vite)",
    "Angular 18",
    "Vue 3 (Nuxt.js)",
    "SvelteKit",
  ],
  "Mobile App": [
    "React Native (Expo SDK 52)",
    "Flutter 3.x (Dart)",
    "Swift (iOS Native)",
    "Kotlin / Jetpack Compose (Android)",
  ],
  "Desktop App": [
    "Electron (React / TypeScript)",
    "Tauri (Rust + React)",
    "Flutter Desktop",
    ".NET MAUI",
  ],
};

export const PLATFORM_UI_OPTIONS: Record<PlatformType, string[]> = {
  "Web App": [
    "Tailwind CSS v4",
    "shadcn/ui",
    "Material UI (MUI)",
    "Chakra UI",
    "Bootstrap 5",
    "Ant Design",
  ],
  "Mobile App": [
    "React Native Paper",
    "Tamagui",
    "NativeWind (Tailwind)",
    "Flutter Material 3",
    "Cupertino (iOS Design)",
  ],
  "Desktop App": [
    "Tailwind CSS",
    "shadcn/ui",
    "Fluent UI (Windows)",
    "macOS Cocoa Native Style",
    "Qt / QML Style",
  ],
};

export const PLATFORM_BACKEND_OPTIONS: Record<PlatformType, string[]> = {
  "Web App": [
    "Python (FastAPI)",
    "Python (Django REST)",
    "Node.js (Express / TypeScript)",
    "Node.js (NestJS)",
    "Go (Gin / Fiber)",
    "Java (Spring Boot 3)",
    "C# (.NET 8 Web API)",
    "Rust (Actix-web / Axum)",
  ],
  "Mobile App": [
    "Python (FastAPI Serverless)",
    "Node.js (NestJS / Express)",
    "Supabase / Firebase Backend",
    "Go (gRPC Services)",
    "Java (Spring Boot)",
  ],
  "Desktop App": [
    "Rust (Tauri Native Core)",
    "Node.js (Local Backend / IPC)",
    "Python (FastAPI Local/Remote)",
    "C# (.NET 8 Local Core)",
    "C++ / Qt Backend",
  ],
};

export interface DatabasePreset {
  id: string;
  name: string;
  description: string;
  databases: string[];
}

export const DATABASE_PRESETS: DatabasePreset[] = [
  {
    id: "postgres_redis",
    name: "PostgreSQL 16 + Redis (Recommended Enterprise Relational)",
    description: "ACID compliance, relational integrity, JSONB support, and Redis in-memory caching.",
    databases: ["PostgreSQL 16", "Redis (In-Memory)"],
  },
  {
    id: "dynamo_s3",
    name: "AWS DynamoDB + Amazon S3 (Serverless Single-Table)",
    description: "Sub-10ms single-digit read/write latency, single-table schema, and encrypted file object storage.",
    databases: ["Amazon DynamoDB (Single-Table)", "Amazon S3 (Encrypted Storage)"],
  },
  {
    id: "supabase_vector",
    name: "Supabase PostgreSQL + pgvector (AI-Ready RAG & Embeddings)",
    description: "Managed PostgreSQL, row-level security, auth integration, and vector cosine distance index.",
    databases: ["PostgreSQL (Supabase)", "pgvector (Vector Store)", "Redis Caching"],
  },
  {
    id: "mongo_redis",
    name: "MongoDB + Redis (Document Store)",
    description: "Flexible JSON document store with Redis caching layer for read-heavy operations.",
    databases: ["MongoDB (Atlas)", "Redis (In-Memory)"],
  },
  {
    id: "pinecone_postgres",
    name: "PostgreSQL + Pinecone Vector Database",
    description: "High-throughput relational transactions paired with dedicated Pinecone vector indexing.",
    databases: ["PostgreSQL 16", "Pinecone (Vector DB)", "Redis"],
  },
  {
    id: "qdrant_weaviate",
    name: "Qdrant / Weaviate Hybrid Vector & Document Store",
    description: "Advanced semantic search, multi-modal embeddings, and hybrid BM25 + dense retrieval.",
    databases: ["Qdrant Vector DB", "PostgreSQL 16", "Redis Caching"],
  },
];

export interface AIModelOption {
  id: string;
  name: string;
  manufacturer: "Google" | "Anthropic" | "OpenAI" | "DeepSeek";
  badge: string;
}

export const AI_MODELS_CATALOG: AIModelOption[] = [
  // Google
  { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash (Latest)", manufacturer: "Google", badge: "Ultra Fast" },
  { id: "gemini-3.5-pro", name: "Gemini 3.5 Pro", manufacturer: "Google", badge: "Deep Reasoning" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", manufacturer: "Google", badge: "Production Multimodal" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (2M Context)", manufacturer: "Google", badge: "Long Context" },
  { id: "gemma-2-27b", name: "Gemma 2 (Open Weights)", manufacturer: "Google", badge: "Edge / Open" },

  // Anthropic
  { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet (Thinking)", manufacturer: "Anthropic", badge: "Hybrid Reasoning" },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet v2", manufacturer: "Anthropic", badge: "Industry Standard" },
  { id: "claude-3-opus", name: "Claude 3 Opus", manufacturer: "Anthropic", badge: "Deep Analytical" },

  // OpenAI
  { id: "gpt-4o", name: "GPT-4o (Omni)", manufacturer: "OpenAI", badge: "Multimodal Leader" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", manufacturer: "OpenAI", badge: "Cost Efficient" },
  { id: "o3-mini", name: "o3-mini (Reasoning)", manufacturer: "OpenAI", badge: "STEM & Code" },
  { id: "o1", name: "o1 Full Reasoning", manufacturer: "OpenAI", badge: "Deep Research" },

  // DeepSeek
  { id: "deepseek-r1", name: "DeepSeek-R1 (Reasoning)", manufacturer: "DeepSeek", badge: "Open Reasoning" },
  { id: "deepseek-v3", name: "DeepSeek-V3", manufacturer: "DeepSeek", badge: "Fast MoE" },
];
