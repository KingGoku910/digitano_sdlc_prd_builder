from agents.base import Agent
from tools import FunctionTool
from agents.models import TIER_2_MODEL, SESSION_CONFIG, GENERATION_CONFIG
from tools.storage import save_intermediate, read_intermediate
from tools.knowledge_base import rag_query
from config.prompts import SOFTWARE_ANALYST_PROMPT

_TEAM_TOOLS = [
    FunctionTool(rag_query),
    FunctionTool(read_intermediate),
    FunctionTool(save_intermediate),
]

_AGENT_KWARGS = dict(
    model=TIER_2_MODEL,
    generation_config=GENERATION_CONFIG,
    session_config=SESSION_CONFIG,
    tools=_TEAM_TOOLS,
)

software_analyst_agent = Agent(
    name="software_analyst",
    description="Software Analyst - NFRs, compliance, risk, testing strategy",
    instruction=SOFTWARE_ANALYST_PROMPT,
    **_AGENT_KWARGS
)

__all__ = ["software_analyst_agent"]
