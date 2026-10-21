"""Model configurations for Tier 1 and Tier 2 Google ADK agents."""
import os
import json
import urllib.request
import urllib.error
from typing import List, Optional, Dict, Any
from config.settings import settings

class LiteLlm:
    def __init__(
        self,
        model: str,
        fallbacks: Optional[List[str]] = None,
        api_key: Optional[str] = None
    ):
        self.raw_model = model
        self.model = self._clean_model_name(model)
        self.fallbacks = [self._clean_model_name(f) for f in (fallbacks or [])]
        self.api_key = (
            api_key
            or os.environ.get("GOOGLE_API_KEY")
            or os.environ.get("GEMINI_API_KEY")
            or os.environ.get("GEMINI_API2_KEY")
            or os.environ.get("GEMINI_API3_KEY")
            or ""
        )

    def _clean_model_name(self, name: str) -> str:
        if not name:
            return "gemini-2.5-flash"
        if name.startswith("gemini/"):
            name = name[7:]
        return name

    def _resolve_candidate_models(self) -> List[str]:
        candidates = [self.model]
        for f in self.fallbacks:
            if f not in candidates:
                candidates.append(f)
        production_fallbacks = ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash"]
        for p in production_fallbacks:
            if p not in candidates:
                candidates.append(p)
        return candidates

    def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        generation_config: Optional[Dict[str, Any]] = None,
    ) -> str:
        candidates = self._resolve_candidate_models()
        api_key = self.api_key or os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY") or ""

        if api_key:
            for model_name in candidates:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                    
                    payload: Dict[str, Any] = {
                        "contents": [
                            {
                                "role": "user",
                                "parts": [{"text": prompt}]
                            }
                        ]
                    }
                    if system_instruction:
                        payload["system_instruction"] = {
                            "parts": [{"text": system_instruction}]
                        }
                    
                    gen_cfg = generation_config or {}
                    if gen_cfg:
                        payload["generationConfig"] = {
                            "temperature": gen_cfg.get("temperature", 0.2),
                            "topP": gen_cfg.get("top_p", 0.95),
                            "maxOutputTokens": gen_cfg.get("max_output_tokens", 8192)
                        }

                    req_data = json.dumps(payload).encode("utf-8")
                    req = urllib.request.Request(
                        url,
                        data=req_data,
                        headers={"Content-Type": "application/json"}
                    )

                    with urllib.request.urlopen(req, timeout=25) as response:
                        if response.status == 200:
                            data = json.loads(response.read().decode("utf-8"))
                            candidates_resp = data.get("candidates", [])
                            if candidates_resp:
                                parts = candidates_resp[0].get("content", {}).get("parts", [])
                                text_parts = [p.get("text", "") for p in parts if "text" in p]
                                full_text = "".join(text_parts).strip()
                                if full_text:
                                    return full_text
                except Exception:
                    continue

        return ""

# ── TIER 1: Research Agent + Orchestrator ──────────────────────────────────
# Primary: gemini-3.1-pro-preview (Google AI Studio)
# Failover: gemini-1.5-pro (Google AI Studio)
TIER_1_MODEL = LiteLlm(
    model=settings.GEMINI_TIER1_MODEL, # e.g. "gemini-3.1-pro-preview"
    fallbacks=[settings.GEMINI_TIER1_FALLBACK], # e.g. "gemini/gemini-1.5-pro"
)

# ── TIER 2: 6 SDLC Technical Agents ────────────────────────────────────────
# Primary: gemini-3.5-flash (Google AI Studio)
# Failover: gemini-2.0-flash (Google AI Studio)
TIER_2_MODEL = LiteLlm(
    model=settings.GEMINI_TIER2_MODEL, # e.g. "gemini/gemini-3.5-flash"
    fallbacks=[settings.GEMINI_TIER2_FALLBACK], # e.g. "gemini/gemini-2.0-flash"
)

# ── Context retention — shared generation config ────────────────────────────
GENERATION_CONFIG = {
    "temperature": 0.2,
    "top_p": 0.95,
    "max_output_tokens": 8192,
}

# ── Session config — prevents context loss between turns ────────────────────
SESSION_CONFIG = {
    "persist_history": True,
    "max_history_turns": 50,
    "include_system_prompt": True,
}

__all__ = [
    "LiteLlm",
    "TIER_1_MODEL",
    "TIER_2_MODEL",
    "GENERATION_CONFIG",
    "SESSION_CONFIG"
]
