# Digitano Builder: Autonomous Multi-Agent SDLC Engine

Digitano Builder is an autonomous multi-agent Software Development Life Cycle (SDLC) engine. The system orchestrates a 7-agent AI Scrum team to analyze project briefs, generate Product Requirement Documents (PRDs), design database schemas, produce API contracts, and output execution-ready Vibe-Coder prompts.

---

## 🏗️ Architecture Overview

The system is organized as a decoupled full-stack monorepo:

```
digitano-builder/
├── frontend/             # Next.js (App Router) Frontend Client
│   ├── public/
│   │   ├── favicon.ico
│   │   └── logo.svg     # Digitano Brand Logo
│   ├── src/
│   │   ├── app/         # Next.js App Router (layout, page, login, dashboard)
│   │   ├── components/  # Cybernetic UI components (Auth, Dashboard, Navigation)
│   │   ├── config/      # Amazon Cognito SDK Client setup
│   │   └── services/    # Axios client with Bearer Token Interceptor
│   ├── netlify.toml     # Netlify Redirects & Build Configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
├── backend/              # Python FastAPI Backend Engine
│   ├── main.py          # FastAPI Core Server & SSE Stream Routes
│   ├── router.py        # 7-Agent SDLC Pipeline & Dual-LLM Failover Engine
│   ├── dynamo_service.py # DynamoDB Boto3 CRUD Service
│   ├── render.yaml      # Render Infrastructure-as-Code Spec
│   ├── requirements.txt # Python Dependencies
│   └── .gitignore
├── .env.example
└── README.md
```

---

## ⚡ The 7-Agent Autonomous Scrum Team

1. **Agent 01 - Product Owner**: Project scope, user personas, comprehensive user stories with Gherkin acceptance criteria.
2. **Agent 02 - Software Analyst**: System architecture boundaries, non-functional requirements, and failure modes.
3. **Agent 03 - UI Lead / UI/UX Architect**: Tailwind CSS tokens, component tree hierarchy, responsive breakpoints.
4. **Agent 04 - Backend Lead / Architect**: FastAPI routes, Pydantic schemas, and Amazon DynamoDB Single-Table schema.
5. **Agent 05 - Full Stack Integrator**: React hooks, Axios interceptor data flow, client state management.
6. **Agent 06 - Cloud Infra Engineer**: AWS Serverless IaC (Cognito, DynamoDB) and Render/Netlify deployment templates.
7. **Agent 07 - Scrum Master**: Consolidated PRD document and copyable Vibe-Coder prompts for AI tools (Cursor, Bolt, Claude Code).

---

## 🛡️ AWS Cloud Services & Configuration

- **AWS Region**: `us-east-1`
- **AWS Cognito User Pool ID**: `us-east-1_Gx1XLOLRJ`
- **AWS Cognito App Client ID**: `408ssjnnva8r0p9adutse6q1ht`
- **Explicit Auth Flow**: `USER_PASSWORD_AUTH`, `ALLOW_REFRESH_TOKEN_AUTH`
- **Amazon DynamoDB Table**: `DigitanoProjects` (On-Demand billing)
  - **Partition Key (PK)**: `USER#<cognito_sub_id>`
  - **Sort Key (SK)**: `PROJECT#<project_id>`
- **Primary AI Reasoning Engine**: AWS Bedrock (`anthropic.claude-3-5-sonnet-20240620-v1:0`)
- **Automated Failover Engine**: Google Gemini Flash API (`google-generativeai`)

---

## 🚀 Quick Start Guide

### 1. Backend (Python / FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Start local server
uvicorn main:app --reload --port 8000
```

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deploying to Cloud

### Netlify (Frontend)
Push the repo to GitHub. Connect the `frontend` folder to Netlify. The `netlify.toml` handles routing (`/*` to `/index.html`) and sets the default build output.

### Render (Backend)
In Render, create a new Web Service and select the repository with `backend/render.yaml` or set:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
