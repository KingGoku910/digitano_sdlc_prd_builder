from agents.base import Agent
from tools import FunctionTool
from agents.models import TIER_2_MODEL, SESSION_CONFIG, GENERATION_CONFIG
from tools.storage import save_intermediate, read_intermediate
from tools.knowledge_base import rag_query
from config.prompts import SOLUTIONS_ARCHITECT_PROMPT

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

solutions_architect_agent = Agent(
    name="solutions_architect",
    description="Solutions Architect - system design, AWS services, integrations",
    instruction=SOLUTIONS_ARCHITECT_PROMPT,
    **_AGENT_KWARGS
)

__all__ = ["solutions_architect_agent"]
