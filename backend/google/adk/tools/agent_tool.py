"""
AgentTool implementation for Google ADK (Agent Development Kit).
Enables agents to be used as tools by other agents (e.g. Researcher using Search Agent & Verifier Agent).
As specified in official Google ADK tutorial (PDF slides 12 & 13).
"""

from typing import Any, Dict

class AgentTool:
    def __init__(self, agent: Any):
        self.agent = agent
        self.name = getattr(agent, "name", "sub_agent")
        self.description = getattr(agent, "description", f"Delegates task execution to {self.name}")

    def __call__(self, prompt: str, **kwargs) -> str:
        return self.run(prompt, **kwargs)

    def run(self, prompt: str, **kwargs) -> str:
        if hasattr(self.agent, "run"):
            return self.agent.run(prompt)
        return f"Output from {self.name}: Completed delegation."
