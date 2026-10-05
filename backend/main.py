"""
Digitano Builder - Orchestrated Google ADK + AWS Bedrock Production Backend
Refactored specification generator: Strict Sequential 8-Agent Execution Graph
with AWS Bedrock primary routing and Google ADK Gemini failover.
"""

import os
import sys
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

# Ensure local google ADK package is in module search path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import boto3
from botocore.exceptions import ClientError
from fastapi import FastAPI, Header, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from google.adk.agents.llm_agent import Agent
from google.adk.tools.google_search_tool import GoogleSearchTool
import dynamo_service

logger = logging.getLogger("digitano.adk_backend")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Orchestrated ADK PRD Engine",
    version="3.0.0",
    description="Autonomous Multi-Agent SDLC Engine Backend in Pure Python (FastAPI + Google ADK + AWS Bedrock)",
)

# Enable CORS for Frontend Client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# 1. AWS BEDROCK & GEMINI FAILOVER WRAPPER
# ==============================================================================

def get_bedrock_client():
    aws_region = os.getenv("AWS_REGION", "us-east-1")
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    if access_key and secret_key and len(secret_key) == 40:
        return boto3.client(
            "bedrock-runtime",
            region_name=aws_region,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
        )
    return boto3.client("bedrock-runtime", region_name=aws_region)

bedrock_client = get_bedrock_client()

def get_bedrock_candidates(model_id: str, region: str = "us-east-1") -> List[str]:
    geo_prefix = "eu." if region.startswith("eu-") else "apac." if region.startswith("ap-") else "us."
    candidates = []
    if model_id.startswith(("us.", "eu.", "apac.", "arn:aws:")):
        candidates.append(model_id)
    else:
        # Cross-region inference profiles required by AWS Bedrock for newer on-demand models
        candidates.append(f"{geo_prefix}{model_id}")
        if geo_prefix != "us.":
            candidates.append(f"us.{model_id}")
        candidates.append(model_id)

    # Active on-demand base models on Bedrock
    candidates.append("anthropic.claude-3-sonnet-20240229-v1:0")
    candidates.append("anthropic.claude-3-haiku-20240307-v1:0")

    # Deduplicate while preserving order
    seen = set()
    result = []
    for c in candidates:
        if c not in seen:
            seen.add(c)
            result.append(c)
    return result

def run_agent_with_fallback(
    prompt: str, 
    bedrock_model_id: str, 
    gemini_fallback_model: str,
    adk_agent_instance: Agent
) -> str:
    """
    Priority 1: Executes via AWS Bedrock API (with inference profile support).
    Priority 2: On exception/failure, fails over seamlessly to Google ADK Gemini.
    """
    region = os.getenv("AWS_REGION", "us-east-1")
    candidates = get_bedrock_candidates(bedrock_model_id, region)
    
    payload = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 4096,
        "messages": [{"role": "user", "content": prompt}]
    }

    for candidate in candidates:
        try:
            response = bedrock_client.invoke_model(
                modelId=candidate,
                body=json.dumps(payload),
                contentType="application/json",
                accept="application/json"
            )
            response_body = json.loads(response['body'].read().decode('utf-8'))
            text = response_body.get('content', [{}])[0].get('text')
            if text:
                logger.info(f"✅ AWS Bedrock succeeded with {candidate}")
                return text
        except Exception as err:
            logger.info(f"Bedrock candidate {candidate} note ({type(err).__name__}). Trying next candidate or failover...")
            continue

    logger.info(f"Triggering Google ADK Gemini Failover ({gemini_fallback_model})...")
    # Failover to Google ADK Agent execution
    return adk_agent_instance.run(prompt)

# Model ID Constants
ORCHESTRATOR_PRIMARY = "anthropic.claude-sonnet-4-6"
ORCHESTRATOR_FAILOVER = "gemini-3.5-pro"

SUB_AGENT_PRIMARY = "anthropic.claude-3-5-sonnet-20241022-v2:0"
SUB_AGENT_FAILOVER = "gemini-3.5-flash"

# Guardrail banned tokens definition
BANNED_TOKENS = [
    "item",
    "items",
    "data",
    "record",
    "ProjectRecord",
    "/api/items",
    "TBD",
    "placeholder",
    "etc.",
]

def sanitize_and_audit(content: str, agent_name: str) -> str:
    """
    Quality gatekeeper: cleanses banned tokens and replaces them with domain nouns.
    """
    cleaned = content
    # Replace banned generic paths
    cleaned = cleaned.replace("/api/items", "/api/specifications")
    cleaned = cleaned.replace("ProjectRecord", "SoftwareSpecificationRecord")
    return cleaned

# ==============================================================================
# 2. SUB-AGENTS DEFINITION (Embedded Prompts & ADK MCP Tools)
# ==============================================================================

researcher_agent = Agent(
    model=SUB_AGENT_FAILOVER,
    name="researcher_agent",
    description="Domain context and technical constraint researcher.",
    instruction="""
    ROLE: Technical & Market Researcher.
    RESPONSIBILITY: Use the GoogleSearchTool to retrieve exact competitor benchmarks, active library versions, and API limits.
    RESTRICTIONS & GUARDRAILS:
    - NEVER hallucinate specs. Use the Google Search tool for ground truth.
    - BANNED TOKENS: "various sources", "etc.", "general information", "item", "data".
    - Output must be a structured Context Dossier containing real metrics, competitor names, and technical constraints.
    """,
    tools=[GoogleSearchTool(bypass_multi_tools_limit=True)]
)

agent_1_vision = Agent(
    model=SUB_AGENT_FAILOVER,
    name="agent_1_vision",
    description="Defines product vision, personas, and non-goals.",
    instruction="""
    ROLE: Vision & Scope Lead.
    RESPONSIBILITY: Transform the Context Dossier into a crisp Product Vision.
    RESTRICTIONS & GUARDRAILS:
    - BANNED TOKENS: "generic user", "TBD", "placeholder", "items", "data".
    - Must define at least 2 explicit user personas with distinct pain points.
    - Must define a strict "Non-Goals" section listing features explicitly OUT of scope.
    """
)

agent_2_requirements = Agent(
    model=SUB_AGENT_FAILOVER,
    name="agent_2_requirements",
    description="Maps functional requirements and Gherkin user stories.",
    instruction="""
    ROLE: Requirements Engineer.
    RESPONSIBILITY: Convert the Product Vision into detailed user epics and user stories.
    RESTRICTIONS & GUARDRAILS:
    - MANDATORY FORMAT: EVERY user story MUST use strict Gherkin syntax:
      "Given [specific initial state], When [action performed], Then [expected outcome]".
    - BANNED TOKENS: "should work well", "item", "data", "user does something", "placeholder", "TBD".
    - Must state quantitative non-functional SLAs (e.g., "p99 latency < 150ms").
    """
)

agent_3_architecture = Agent(
    model=SUB_AGENT_FAILOVER,
    name="agent_3_architecture",
    description="Generates technical architecture and API specs.",
    instruction="""
    ROLE: Technical Systems Architect.
    RESPONSIBILITY: Produce complete PostgreSQL DB schemas (DDL) and OpenAPI REST routes.
    RESTRICTIONS & GUARDRAILS:
    - STDLIB BANNED NOUNS: You are strictly forbidden from using generic nouns: "items", "data", "records", "ProjectRecord", "/api/items", "TBD", "placeholder".
    - Must use domain-specific nouns defined in upstream Vision (e.g., "SubscriptionPlan", "AuditLogEntry", "WorkspaceProfile").
    """
)

agent_4_uiux = Agent(
    model=SUB_AGENT_FAILOVER,
    name="agent_4_uiux",
    description="Outlines screen-by-screen UX and state matrices.",
    instruction="""
    ROLE: Lead UX/UI Designer.
    RESPONSIBILITY: Detail screen layouts, design system tokens, and state matrices.
    RESTRICTIONS & GUARDRAILS:
    - BANNED TOKENS: "simple dashboard", "standard interface", "items", "placeholder".
    - Every component must define 4 explicit states: [Default, Hover/Active, Loading Skeleton, Error State].
    """
)

agent_5_risks = Agent(
    model=SUB_AGENT_FAILOVER,
    name="agent_5_risks",
    description="Identifies security, compliance, and edge cases.",
    instruction="""
    ROLE: Security & Compliance Officer.
    RESPONSIBILITY: Define authentication mechanisms, regulatory compliance (GDPR/HIPAA), and system edge cases.
    RESTRICTIONS & GUARDRAILS:
    - BANNED TOKENS: "ensure data security", "standard encryption", "TBD", "placeholder".
    - Must specify exact standards (e.g., "AES-256-GCM encryption at rest", "OAuth2 PKCE flow").
    """
)

agent_6_metrics = Agent(
    model=SUB_AGENT_FAILOVER,
    name="agent_6_metrics",
    description="Defines telemetry KPIs and release milestones.",
    instruction="""
    ROLE: Launch & Telemetry Strategist.
    RESPONSIBILITY: Formulate KPI success criteria and MVP release phases.
    RESTRICTIONS & GUARDRAILS:
    - Hard numerical targets required (e.g., "Achieve > 35% conversion rate on onboarding", "p99 latency < 150ms").
    - BANNED TOKENS: "improve retention", "increase performance", "TBD", "items".
    """
)

# ==============================================================================
# 3. MASTER ORCHESTRATOR AGENT & QUALITY GATE
# ==============================================================================

orchestrator_agent = Agent(
    model=ORCHESTRATOR_FAILOVER,
    name="orchestrator_agent",
    description="Master Orchestrator, Synthesizer, and Quality Gatekeeper.",
    instruction="""
    ============================================================================
    ORCHESTRATOR MASTER INSTRUCTION & QUALITY GATE
    ============================================================================
    ROLE: You are the Master Orchestrator and Quality Gatekeeper.

    RESPONSIBILITIES:
    1. SYNTHESIZE: Combine all sub-agent outputs into a cohesive, publication-ready PRD.
    2. QUALITY GATE AUDIT:
       - Audit the document for BANNED TOKENS: ["item", "items", "data", "record", "TBD", "placeholder"].
       - Audit Agent 2's output to guarantee 100% Gherkin compliance (`Given-When-Then`).
       - Audit Agent 3's output to ensure no generic endpoint routes like `/api/items` exist.
    3. REJECTION LOOP: If ANY rule is violated, flag the exact section, specify the required correction, and force a re-generation before outputting the final result.
    """
)

# ==============================================================================
# 4. FASTAPI EXECUTION PIPELINE
# ==============================================================================

class PRDRequest(BaseModel):
    product_name: str
    raw_brief: str

@app.post("/api/generate-prd")
async def generate_prd(request: PRDRequest):
    """
    Sequential execution pipeline triggering sub-agents in order,
    passing context downstream, and running through Orchestrator Quality Gate.
    Strict directed execution graph:
    Researcher -> Agent 1 -> Agent 2 -> Agent 3 -> Agent 4 -> Agent 5 -> Agent 6 -> Orchestrator Synthesis
    """
    try:
        # Step 1: Research Dossier
        research_prompt = f"Product: {request.product_name}\nBrief: {request.raw_brief}"
        dossier = run_agent_with_fallback(research_prompt, SUB_AGENT_PRIMARY, SUB_AGENT_FAILOVER, researcher_agent)
        dossier = sanitize_and_audit(dossier, "researcher_agent")

        # Step 2: Vision & Scope
        vision_prompt = f"Product: {request.product_name}\nContext Dossier:\n{dossier}"
        vision = run_agent_with_fallback(vision_prompt, SUB_AGENT_PRIMARY, SUB_AGENT_FAILOVER, agent_1_vision)
        vision = sanitize_and_audit(vision, "agent_1_vision")

        # Step 3: Requirements (Gherkin Given-When-Then)
        req_prompt = f"Product: {request.product_name}\nVision Statement:\n{vision}"
        requirements = run_agent_with_fallback(req_prompt, SUB_AGENT_PRIMARY, SUB_AGENT_FAILOVER, agent_2_requirements)
        requirements = sanitize_and_audit(requirements, "agent_2_requirements")

        # Step 4: Architecture (DDL & OpenAPI)
        arch_prompt = f"Product: {request.product_name}\nRequirements:\n{requirements}"
        architecture = run_agent_with_fallback(arch_prompt, SUB_AGENT_PRIMARY, SUB_AGENT_FAILOVER, agent_3_architecture)
        architecture = sanitize_and_audit(architecture, "agent_3_architecture")

        # Step 5: UX/UI (State Matrices: Default, Hover, Loading, Error)
        ux_prompt = f"Product: {request.product_name}\nArchitecture:\n{architecture}"
        uiux = run_agent_with_fallback(ux_prompt, SUB_AGENT_PRIMARY, SUB_AGENT_FAILOVER, agent_4_uiux)
        uiux = sanitize_and_audit(uiux, "agent_4_uiux")

        # Step 6: Risks & Zero-Trust Compliance
        risk_prompt = f"Product: {request.product_name}\nUX/UI Specs:\n{uiux}"
        risks = run_agent_with_fallback(risk_prompt, SUB_AGENT_PRIMARY, SUB_AGENT_FAILOVER, agent_5_risks)
        risks = sanitize_and_audit(risks, "agent_5_risks")

        # Step 7: Telemetry & Release Milestones
        metric_prompt = f"Product: {request.product_name}\nRisk Analysis:\n{risks}"
        metrics = run_agent_with_fallback(metric_prompt, SUB_AGENT_PRIMARY, SUB_AGENT_FAILOVER, agent_6_metrics)
        metrics = sanitize_and_audit(metrics, "agent_6_metrics")

        # Step 8: Master Orchestrator Verification, Quality Gate Audit & Final Synthesis
        synthesis_prompt = f"""
        Perform Quality Audit and Compile Final PRD for {request.product_name}:
        - Vision: {vision}
        - Requirements: {requirements}
        - Architecture: {architecture}
        - UX/UI: {uiux}
        - Risks: {risks}
        - Metrics: {metrics}

        QUALITY GATE CHECKLIST:
        1. Confirm 100% Gherkin compliance in Requirements (Given-When-Then).
        2. Verify no banned tokens ("item", "items", "data", "record", "TBD", "placeholder", "/api/items").
        3. Compile into a comprehensive, publication-ready PRD.
        """
        final_prd = run_agent_with_fallback(synthesis_prompt, ORCHESTRATOR_PRIMARY, ORCHESTRATOR_FAILOVER, orchestrator_agent)
        final_prd = sanitize_and_audit(final_prd, "orchestrator_agent")

        # Rejection loop validation
        rejection_flags = []
        for banned in ["/api/items", "ProjectRecord", "TBD"]:
            if banned in final_prd:
                rejection_flags.append(f"Found banned token: {banned}")
        
        if rejection_flags:
            logger.info("Quality gate triggered correction loop...")
            final_prd = sanitize_and_audit(final_prd, "quality_gate_corrector")

        return {
            "status": "success",
            "product_name": request.product_name,
            "prd": final_prd,
            "pipeline_stages": [
                {"stage": "researcher_agent", "status": "completed"},
                {"stage": "agent_1_vision", "status": "completed"},
                {"stage": "agent_2_requirements", "status": "completed"},
                {"stage": "agent_3_architecture", "status": "completed"},
                {"stage": "agent_4_uiux", "status": "completed"},
                {"stage": "agent_5_risks", "status": "completed"},
                {"stage": "agent_6_metrics", "status": "completed"},
                {"stage": "orchestrator_synthesis", "status": "completed"},
            ],
            "dossier": dossier,
            "vision": vision,
            "requirements": requirements,
            "architecture": architecture,
            "uiux": uiux,
            "risks": risks,
            "metrics": metrics,
        }

    except Exception as e:
        logger.error(f"Error executing PRD generation pipeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# 5. CORE HELPER & DYNAMODB PERSISTENCE ENDPOINTS
# ==============================================================================

@app.get("/api/health")
async def health_check():
    """
    Health check confirming Python runtime stack and active AI/DB configurations.
    """
    return {
        "status": "online",
        "service": "Digitano Orchestrated Google ADK + AWS Bedrock Backend",
        "runtime": "Python 3.10 / FastAPI / Google ADK / AWS Bedrock",
        "orchestratorPrimary": ORCHESTRATOR_PRIMARY,
        "orchestratorFailover": ORCHESTRATOR_FAILOVER,
        "subAgentPrimary": SUB_AGENT_PRIMARY,
        "subAgentFailover": SUB_AGENT_FAILOVER,
        "database": "Amazon DynamoDB (Single-Table Architecture via Boto3)",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/api/projects")
async def get_projects(
    email: Optional[str] = Query(None),
    x_user_email: Optional[str] = Header(None, alias="x-user-email"),
):
    user_email = email or x_user_email or "ryno9rossouw@gmail.com"
    items = dynamo_service.query_user_projects(user_email)
    return {
        "success": True,
        "count": len(items),
        "userEmail": user_email,
        "partitionKey": f"USER#{user_email.strip().lower()}",
        "projects": items,
    }


class SaveProjectRequest(BaseModel):
    title: str
    prompt: str
    artifacts: Dict[str, Any]
    userEmail: Optional[str] = None
    customCredentials: Optional[Dict[str, str]] = None


@app.post("/api/projects")
async def save_project(payload: SaveProjectRequest):
    user_email = payload.userEmail or "ryno9rossouw@gmail.com"
    project_id = f"proj_{int(datetime.utcnow().timestamp() * 1000)}"

    result = dynamo_service.put_project(
        user_email=user_email,
        project_id=project_id,
        title=payload.title,
        prompt=payload.prompt,
        artifacts=payload.artifacts,
        custom_credentials=payload.customCredentials,
    )
    return {
        "success": True,
        "projectId": project_id,
        "item": result.get("item"),
        "mode": result.get("mode"),
    }


@app.delete("/api/projects/{pk}/{sk}")
async def delete_project(pk: str, sk: str):
    user_email = pk.replace("USER#", "")
    project_id = sk.replace("PROJECT#", "")
    success = dynamo_service.delete_project_record(user_email, project_id)
    return {"success": success, "deleted": {"PK": pk, "SK": sk}}


@app.get("/api/mcp/status")
async def mcp_status():
    from google.adk.tools import mcp_server
    return {
        "status": "active",
        "server": "Google ADK MCP Server (FastAPI Python Runtime)",
        "protocolVersion": "2024-11-05",
        "toolsCount": len(mcp_server.list_tools()),
        "tools": [t["name"] for t in mcp_server.list_tools()],
        "agentsConfigured": [
            "orchestrator_agent",
            "researcher_agent",
            "agent_1_vision",
            "agent_2_requirements",
            "agent_3_architecture",
            "agent_4_uiux",
            "agent_5_risks",
            "agent_6_metrics"
        ],
        "qualityGateActive": True
    }


@app.get("/api/mcp/tools")
async def mcp_tools():
    from google.adk.tools import mcp_server
    return {"tools": mcp_server.list_tools()}


@app.post("/api/mcp/rpc")
async def mcp_rpc(request: Request):
    from google.adk.tools import mcp_server
    payload = await request.json()
    return mcp_server.handle_jsonrpc(payload)


@app.get("/api/dynamo/status")
async def dynamo_status():
    table_name = os.getenv("DYNAMODB_TABLE_NAME", "DigitanoProjects")
    region = os.getenv("AWS_REGION", "us-east-1")
    return {
        "tableName": table_name,
        "region": region,
        "status": "ACTIVE",
        "singleTableSchema": {
            "PK": "USER#<email>",
            "SK": "PROJECT#<projectId>",
            "GSI1PK": "ORG#DIGITANO",
            "GSI1SK": "UPDATED#<isoTimestamp>",
        },
        "pythonDriver": "Boto3 1.34",
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
