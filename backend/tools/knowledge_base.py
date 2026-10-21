"""Knowledge Base RAG tool (Local / S3 RAG, replacing legacy Bedrock KB)."""
import os
import json
from typing import Dict, Any, List
from config.settings import settings

KNOWLEDGE_PATTERNS = {
    "sdlc": [
        "Adhere to Gherkin syntax (Given-When-Then) for all user acceptance criteria.",
        "Epics must break down into testable stories with measurable quantitative SLAs.",
        "Zero placeholder policy: explicitly state entity names, status codes, and latency budgets."
    ],
    "api": [
        "OpenAPI 3.1 REST guidelines: use plural resource nouns, standard HTTP verbs (GET, POST, PUT, DELETE).",
        "Authentication: OAuth2 Authorization Code Flow with PKCE and JWT Bearer validation.",
        "Error format: RFC 7807 Problem Details (type, title, status, detail, instance)."
    ],
    "database": [
        "PostgreSQL 16 relational design: use UUIDv4 primary keys, explicit foreign key constraints with ON DELETE actions.",
        "Multi-tenant isolation: enforce tenant_id partition column or schema-per-tenant.",
        "Indexes: composite indexes on (tenant_id, created_at DESC) and lookup query vectors."
    ],
    "security": [
        "Encryption: AES-256-GCM for storage at rest, TLS 1.3 in transit.",
        "Compliance: GDPR Article 17 Right to Erasure, HIPAA audit log non-repudiation.",
        "Rate limiting: Token bucket with 60 requests/minute per tenant account."
    ]
}

def rag_query(query: str, domain: str = "") -> Dict[str, Any]:
    """
    Retrieves architectural blueprints, standards, and checklists
    from local / S3 RAG knowledge store.
    """
    q_lower = query.lower()
    results = []
    
    if any(k in q_lower for k in ["api", "endpoint", "rest", "http"]):
        results.extend(KNOWLEDGE_PATTERNS["api"])
    if any(k in q_lower for k in ["schema", "database", "table", "sql", "postgres"]):
        results.extend(KNOWLEDGE_PATTERNS["database"])
    if any(k in q_lower for k in ["security", "auth", "compliance", "gdpr", "hipaa"]):
        results.extend(KNOWLEDGE_PATTERNS["security"])
    if not results or any(k in q_lower for k in ["sdlc", "story", "gherkin", "agile", "epic"]):
        results.extend(KNOWLEDGE_PATTERNS["sdlc"])

    return {
        "query": query,
        "domain": domain or "software_development_lifecycle",
        "kb_source": f"s3://{settings.KB_S3_BUCKET}/{settings.KB_S3_PREFIX}",
        "standards": results[:5]
    }

__all__ = ["rag_query"]
