# agents/orchestrator.py
from agents.base import Agent
from tools import FunctionTool
from agents.models import TIER_1_MODEL, SESSION_CONFIG, GENERATION_CONFIG
from config.prompts import ORCHESTRATOR_PROMPT
from tools.storage import save_artifact, read_intermediate
from tools.knowledge_base import rag_query
from tools.quality import audit_banned_tokens, validate_gherkin
from services.dynamodb import update_project_status

# Sub-agents imported so the Orchestrator can delegate to them
from agents.team.product_owner import product_owner_agent
from agents.team.solutions_architect import solutions_architect_agent
from agents.team.database_engineer import database_engineer_agent
from agents.team.fullstack_engineer import fullstack_engineer_agent
from agents.team.backend_engineer import backend_engineer_agent
from agents.team.software_analyst import software_analyst_agent

orchestrator_agent = Agent(
    name="digitano_orchestrator",
    model=TIER_1_MODEL, # gemini/gemini-3.1-pro-preview
    description=(
        "Senior Engineering Lead and Documentation Architect. "
        "Coordinates the technical team, resolves conflicts between agent "
        "responses, and assembles the 5-part artifact documentation suite."
    ),
    instruction=ORCHESTRATOR_PROMPT,
    generation_config=GENERATION_CONFIG,
    session_config=SESSION_CONFIG,
    sub_agents=[
        product_owner_agent,
        solutions_architect_agent,
        database_engineer_agent,
        fullstack_engineer_agent,
        backend_engineer_agent,
        software_analyst_agent,
    ],
    tools=[
        FunctionTool(save_artifact),
        FunctionTool(read_intermediate),
        FunctionTool(rag_query),
        FunctionTool(audit_banned_tokens),
        FunctionTool(validate_gherkin),
        FunctionTool(update_project_status),
    ]
)

__all__ = ["orchestrator_agent"]
