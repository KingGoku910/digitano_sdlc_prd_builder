import os
from typing import Optional

try:
    from pydantic import BaseModel
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)

class Settings(BaseModel):
    # Tier 1: Research Agent + Orchestrator
    GEMINI_TIER1_MODEL: str = os.environ.get("GEMINI_TIER1_MODEL", "gemini-3.1-pro-preview")
    GEMINI_TIER1_FALLBACK: str = os.environ.get("GEMINI_TIER1_FALLBACK", "gemini-1.5-pro")

    # Tier 2: 6 SDLC Technical Agents
    GEMINI_TIER2_MODEL: str = os.environ.get("GEMINI_TIER2_MODEL", "gemini-3.5-flash")
    GEMINI_TIER2_FALLBACK: str = os.environ.get("GEMINI_TIER2_FALLBACK", "gemini-2.0-flash")

    # Storage & Cloud
    KB_S3_BUCKET: str = os.environ.get("KB_S3_BUCKET", "digitano-sdlc-kb-docs")
    KB_S3_PREFIX: str = os.environ.get("KB_S3_PREFIX", "docs/")
    AWS_REGION: str = os.environ.get("AWS_REGION", "us-east-1")
    DYNAMODB_TABLE_NAME: str = os.environ.get("DYNAMODB_TABLE_NAME", "DigitanoProjects")

    # API Keys
    GOOGLE_API_KEY: str = (
        os.environ.get("GOOGLE_API_KEY")
        or os.environ.get("GEMINI_API_KEY")
        or os.environ.get("GEMINI_API2_KEY")
        or ""
    )

settings = Settings()

__all__ = ["settings", "Settings"]
