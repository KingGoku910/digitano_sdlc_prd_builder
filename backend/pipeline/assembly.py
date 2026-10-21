# pipeline/assembly.py
# 5 artifact assembly functions.
# Called by the Orchestrator agent via save_artifact (tools/storage.py).
# Each function takes the relevant agent responses and returns Markdown.

def assemble_research_document(research_context: dict, agent_responses: dict) -> str:
    rc = research_context or {}
    core_problems = rc.get("core_problems", [])
    if isinstance(core_problems, list):
        core_problems_str = "\n".join(f"- {p}" for p in core_problems)
    else:
        core_problems_str = str(core_problems)

    key_features = rc.get("key_features", [])
    if isinstance(key_features, list):
        key_features_str = "\n".join(f"- {f}" for f in key_features)
    else:
        key_features_str = str(key_features)

    comp_landscape = rc.get("competitive_landscape", [])
    if isinstance(comp_landscape, list):
        comp_landscape_str = "\n".join(f"- {c}" for c in comp_landscape)
    else:
        comp_landscape_str = str(comp_landscape)

    open_questions = rc.get("open_questions", [])
    if isinstance(open_questions, list):
        open_questions_str = "\n".join(f"- {q}" for q in open_questions)
    else:
        open_questions_str = str(open_questions)

    agent_resp_str = "\n".join(
        f"### {k}\n{v}" for k, v in (agent_responses or {}).items()
    )

    return f"""# Research Document

## Product Summary
{rc.get('product_summary', '')}

## Target Users
{rc.get('target_users', '')}

## Core Problems
{core_problems_str}

## Key Features
{key_features_str}

## Competitive Landscape
{comp_landscape_str}

## Recommended Tech Signals
{rc.get('recommended_tech_signals', '')}

## Compliance Signals
{rc.get('compliance_signals', '')}

## Open Questions
{open_questions_str}

## Agent Responses
{agent_resp_str}
"""

def assemble_prd(product_owner: dict, software_analyst: dict) -> str:
    po = product_owner or {}
    sa = software_analyst or {}
    return f"""# Product Requirements Document

## User Personas
{po.get('user_personas', '')}

## User Stories
{po.get('user_stories', '')}

## MVP Features (MoSCoW)
{po.get('mvp_features', '')}

## Out of Scope
{po.get('out_of_scope', '')}

## Success Metrics
{po.get('success_metrics', '')}

## Non-Functional Requirements
{sa.get('non_functional_requirements', '')}

## Compliance Considerations
{sa.get('compliance_considerations', '')}

## Risk Register
{sa.get('risk_register', '')}

## Testing Strategy
{sa.get('testing_strategy', '')}

## Definition of Done
{sa.get('definition_of_done', '')}
"""

def assemble_database_schema(database_engineer: dict, solutions_architect: dict) -> str:
    de = database_engineer or {}
    sa = solutions_architect or {}
    return f"""# Database Schema

## Recommended Database
{de.get('recommended_db', '')}

## Entities
{de.get('entities', '')}

## Relationships
{de.get('relationships', '')}

## Indexes
{de.get('indexes', '')}

## Data Patterns
{de.get('data_patterns', '')}

## Migration Strategy
{de.get('migration_strategy', '')}

## Entity Relationship Diagram
```mermaid
{de.get('mermaid_erd', '')}
```

## Architecture Context
{sa.get('architecture_pattern', '')}
"""

def assemble_api_document(backend_engineer: dict, solutions_architect: dict) -> str:
    be = backend_engineer or {}
    sa = solutions_architect or {}
    return f"""# API Document

## API Style
{be.get('api_style', '')}

## Authentication Strategy
{be.get('auth_strategy', '')}

## Endpoints
{be.get('endpoints', '')}

## Business Logic Modules
{be.get('business_logic_modules', '')}

## Background Jobs
{be.get('background_jobs', '')}

## Error Handling
{be.get('error_handling', '')}

## Rate Limiting
{be.get('rate_limiting', '')}

## AWS Services
{sa.get('aws_services', '')}
"""

def assemble_vibe_code_prompts(
    fullstack_engineer: dict,
    prd: str,
    db_schema: str,
    api_doc: str
) -> str:
    fe = fullstack_engineer or {}
    return f"""# Vibe Code Prompts

## Frontend Framework
{fe.get('frontend_framework', '')}

## UI Components
{fe.get('ui_components', '')}

## Page Structure
{fe.get('page_structure', '')}

## State Management
{fe.get('state_management', '')}

## UX Patterns
{fe.get('ux_patterns', '')}

## Vibe Code Hints
{fe.get('vibe_code_hints', '')}

---

## Reference: PRD Summary
{(prd or '')[:2000]}

## Reference: Database Schema Summary
{(db_schema or '')[:2000]}

## Reference: API Document Summary
{(api_doc or '')[:2000]}
"""

__all__ = [
    "assemble_research_document",
    "assemble_prd",
    "assemble_database_schema",
    "assemble_api_document",
    "assemble_vibe_code_prompts",
]
