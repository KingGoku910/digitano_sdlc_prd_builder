# agents/research_agent.py
from agents.base import Agent
from tools import FunctionTool, google_search
from agents.models import TIER_1_MODEL, SESSION_CONFIG, GENERATION_CONFIG
from config.prompts import RESEARCH_AGENT_PROMPT
from tools.web import fetch_url, detect_domain_compliance
from tools.storage import save_intermediate
from tools.knowledge_base import rag_query
from services.dynamodb import update_project_status

research_agent = Agent(
    name="digitano_research_agent",
    model=TIER_1_MODEL, # gemini/gemini-3.1-pro-preview
    description=(
        "Senior Research Analyst specialising in software product discovery. "
        "Transforms vague app ideas into structured research context and "
        "generates domain-specific questionnaires for each SDLC specialist."
    ),
    instruction=RESEARCH_AGENT_PROMPT,
    generation_config=GENERATION_CONFIG,
    session_config=SESSION_CONFIG,
    tools=[
        google_search,
        FunctionTool(fetch_url),
        FunctionTool(detect_domain_compliance),
        FunctionTool(save_intermediate),
        FunctionTool(rag_query),
        FunctionTool(update_project_status),
    ]
)

__all__ = ["research_agent"]
