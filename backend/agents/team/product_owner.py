from agents.base import Agent
from tools import FunctionTool
from agents.models import TIER_2_MODEL, SESSION_CONFIG, GENERATION_CONFIG
from tools.storage import save_intermediate, read_intermediate
from tools.knowledge_base import rag_query
from config.prompts import PRODUCT_OWNER_PROMPT

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

product_owner_agent = Agent(
    name="product_owner",
    description="Product Owner - user stories, acceptance criteria, MVP scope",
    instruction=PRODUCT_OWNER_PROMPT,
    **_AGENT_KWARGS
)

__all__ = ["product_owner_agent"]
