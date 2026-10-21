"""FunctionTool implementation."""
from typing import Callable, Any, Dict, Optional

class FunctionTool:
    def __init__(self, func: Callable, name: Optional[str] = None, description: Optional[str] = None):
        self.func = func
        self.name = name or func.__name__
        self.description = description or (func.__doc__ or "").strip()

    def __call__(self, *args, **kwargs) -> Any:
        return self.func(*args, **kwargs)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
        }

__all__ = ["FunctionTool"]
