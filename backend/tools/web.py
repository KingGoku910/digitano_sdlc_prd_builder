"""Web fetching and compliance signal detection tools."""
import urllib.request
import urllib.error
import re
from typing import Dict, Any, List

def fetch_url(url: str, timeout_seconds: int = 5) -> str:
    """
    Real URL fetcher used by Research Agent.
    Only fetches valid HTTP/HTTPS URLs.
    """
    if not (url.startswith("http://") or url.startswith("https://")):
        return f"Invalid URL scheme for: {url}"

    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Digitano-Research-Agent/1.0 (Google-ADK-Pipeline)"}
        )
        with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
            raw_html = resp.read().decode("utf-8", errors="ignore")
            # Strip HTML tags
            text = re.sub(r"<[^>]+>", " ", raw_html)
            text = re.sub(r"\s+", " ", text).strip()
            return text[:4000]
    except Exception as e:
        return f"Unable to fetch URL {url}: {str(e)}"

def detect_domain_compliance(brief: str) -> Dict[str, Any]:
    """
    Analyzes an application brief for compliance requirements (GDPR, HIPAA, SOC2, PCI-DSS).
    """
    b_lower = brief.lower()
    signals: List[str] = []
    
    if any(k in b_lower for k in ["health", "medical", "patient", "clinical", "doctor", "ehr"]):
        signals.append("HIPAA (Health Insurance Portability and Accountability Act) compliance required for ePHI.")
    if any(k in b_lower for k in ["payment", "card", "billing", "checkout", "stripe", "transaction"]):
        signals.append("PCI-DSS Level 1 compliance required for cardholder data processing.")
    if any(k in b_lower for k in ["europe", "eu", "user data", "personal data", "gdpr"]):
        signals.append("GDPR compliance required: user consent, right to be forgotten, and data minimization.")
    
    # Default baseline
    if not signals:
        signals.append("SOC2 Type II & Zero-Trust security boundary with AES-256-GCM encryption at rest.")

    return {
        "compliance_detected": len(signals) > 0,
        "signals": signals
    }

__all__ = ["fetch_url", "detect_domain_compliance"]
