"""Quality gate tools for Google ADK pipeline."""
import re
from typing import Dict, List, Any

# Tokens that indicate generic, placeholder, or hallucinated content.
# Extend this list as you discover new patterns in agent outputs.
BANNED_TOKENS = [
    "lorem ipsum", "placeholder", "todo", "fixme", "tbd", "n/a",
    "insert here", "coming soon", "example.com", "your company",
    "[company name]", "[product name]", "[insert",
]

def audit_banned_tokens(content: str) -> Dict[str, Any]:
    """
    Scans artifact content for banned generic tokens.
    Returns {passed: bool, violations: [str], sanitized_content: str}
    """
    lower = content.lower()
    violations = [t for t in BANNED_TOKENS if t in lower]
    sanitized = content
    for token in violations:
        sanitized = re.sub(
            re.escape(token),
            f"[REVIEW: {token}]",
            sanitized,
            flags=re.IGNORECASE
        )
    return {
        "passed": len(violations) == 0,
        "violations": violations,
        "sanitized_content": sanitized,
    }

def validate_gherkin(content: str) -> Dict[str, Any]:
    """
    Validates that user stories in the PRD artifact contain
    proper Gherkin acceptance criteria (Given/When/Then).
    Returns {passed: bool, missing_criteria: [str]}
    """
    stories = re.findall(r"As a .+?(?=As a |$)", content, re.DOTALL)
    missing = []
    for story in stories:
        has_given = bool(re.search(r"\bGiven\b", story, re.IGNORECASE))
        has_when = bool(re.search(r"\bWhen\b", story, re.IGNORECASE))
        has_then = bool(re.search(r"\bThen\b", story, re.IGNORECASE))
        if not (has_given and has_when and has_then):
            first_line = story.strip().splitlines()[0][:80] if story.strip() else "User story"
            missing.append(first_line)
    return {
        "passed": len(missing) == 0,
        "missing_criteria": missing,
    }

__all__ = ["BANNED_TOKENS", "audit_banned_tokens", "validate_gherkin"]
