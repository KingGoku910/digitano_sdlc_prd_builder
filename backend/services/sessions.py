"""In-memory session service for Google ADK pipeline context retention."""
import uuid
from typing import Dict, Any, List, Optional

class Session:
    def __init__(self, session_id: str, app_name: str, user_id: str):
        self.id = session_id
        self.app_name = app_name
        self.user_id = user_id
        self.history: List[Dict[str, Any]] = []

    def add_turn(self, role: str, content: str):
        self.history.append({"role": role, "content": content})

    def get_history(self) -> List[Dict[str, Any]]:
        return self.history

    def get_context_window(self, max_turns: int = 50) -> List[Dict[str, Any]]:
        return self.history[-max_turns:]

class InMemorySessionService:
    def __init__(self):
        self._sessions: Dict[str, Session] = {}

    async def create_session(self, app_name: str, user_id: str) -> Session:
        session_id = f"sess_{uuid.uuid4().hex[:12]}"
        session = Session(session_id=session_id, app_name=app_name, user_id=user_id)
        self._sessions[session_id] = session
        return session

    async def get_session(self, session_id: str) -> Optional[Session]:
        return self._sessions.get(session_id)

    def clear(self):
        self._sessions.clear()

__all__ = ["Session", "InMemorySessionService"]
