"""Agent base class for Google ADK architecture."""
from typing import List, Optional, Dict, Any

class Agent:
    def __init__(
        self,
        name: str,
        model: Any = None,
        description: str = "",
        instruction: str = "",
        generation_config: Optional[Dict[str, Any]] = None,
        session_config: Optional[Dict[str, Any]] = None,
        tools: Optional[List[Any]] = None,
        sub_agents: Optional[List['Agent']] = None,
        **kwargs
    ):
        self.name = name
        self.model = model
        self.description = description
        self.instruction = instruction
        self.generation_config = generation_config or {}
        self.session_config = session_config or {}
        self.tools = tools or []
        self.sub_agents = sub_agents or []
        self.extra_kwargs = kwargs

    def __repr__(self) -> str:
        return f"<Agent name={self.name} model={getattr(self.model, 'model', 'default')}>"

__all__ = ["Agent"]
