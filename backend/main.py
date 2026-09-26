"""
Digitano Builder - FastAPI Core Server
Provides Health Check, AWS Cognito RS256 JWKS Verification,
SSE Progress Streaming, and DynamoDB Project Persistence.
"""

import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from dotenv import load_dotenv
load_dotenv()

import httpx
from fastapi import FastAPI, Depends, HTTPException, Query, Header, status
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from jose import jwt, JWTError

from router import run_sdlc_pipeline_stream
import dynamo_service

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("digitano_main")

app = FastAPI(
    title="Digitano SDLC Engine",
    description="Autonomous Multi-Agent SDLC Engine API running on Render",
    version="2.0.0"
)

# CORS Configuration
ALLOWED_ORIGINS = [
    "https://digitano-builder.netlify.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://digitano-backend.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.netlify\.app|https://.*\.bolt\.host|https://.*\.run\.app|http://localhost:.*",
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS Cognito Configuration
COGNITO_REGION = os.getenv("AWS_REGION", "us-east-1")
COGNITO_POOL_ID = os.getenv("COGNITO_USER_POOL_ID", "us-east-1_Gx1XLOLRJ")
COGNITO_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID", "408ssjnnva8r0p9adutse6q1ht")
JWKS_URL = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_POOL_ID}/.well-known/jwks.json"

_JWKS_CACHE: Dict[str, Any] = {}


async def get_jwks() -> Dict[str, Any]:
    """Fetches and caches the AWS Cognito public JWKS keys."""
    global _JWKS_CACHE
    if _JWKS_CACHE:
        return _JWKS_CACHE
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(JWKS_URL)
            if resp.status_code == 200:
                _JWKS_CACHE = resp.json()
                logger.info(f"Successfully loaded JWKS keys from {JWKS_URL}")
                return _JWKS_CACHE
    except Exception as e:
        logger.error(f"Failed to fetch JWKS from AWS Cognito: {e}")
    return {"keys": []}


async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Decodes and validates the Cognito Access Token / ID Token via JWKS RS256.
    Allows demo test user fallback if Authorization is demo token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ")[1]

    # Quick demo bypass for dev testing or sandbox environments
    if token.startswith("demo_token_") or token == "demo-access-token":
        return {
            "sub": "demo-sub-ryno9rossouw",
            "email": "ryno9rossouw@gmail.com",
            "username": "ryno9rossouw"
        }

    jwks = await get_jwks()
    try:
        # Get kid from unverified headers
        unverified_headers = jwt.get_unverified_header(token)
        kid = unverified_headers.get("kid")
        key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)

        if not key:
            # If live JWKS fetch is offline or simulated, allow verified claims or informative reject
            raise HTTPException(status_code=401, detail="Public signing key not found in Cognito JWKS")

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=COGNITO_CLIENT_ID,
            options={"verify_at_hash": False}
        )
        return {
            "sub": payload.get("sub"),
            "email": payload.get("email", payload.get("cognito:username", "authenticated-user")),
            "payload": payload
        }
    except JWTError as e:
        logger.error(f"JWT validation error: {e}")
        # In case token was signed with another claim or demo flow
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.get("/", summary="Health Check Ping")
async def health_check():
    """
    Polled every 10 seconds by BackendStatusIndicator.
    Returns online status and UTC timestamp.
    """
    return {
        "status": "online",
        "service": "Digitano SDLC Engine API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "region": COGNITO_REGION,
        "cognito_pool": COGNITO_POOL_ID
    }


@app.get("/api/stream-progress/{project_id}", summary="SSE 7-Agent SDLC Stream")
async def stream_progress(
    project_id: str,
    prompt: str = Query(..., description="Project brief or vision description"),
    title: Optional[str] = Query("Untitled Project", description="Project display title"),
    token: Optional[str] = Query(None, description="Optional bearer token for query auth"),
    authorization: Optional[str] = Header(None)
):
    """
    Server-Sent Events endpoint streaming real-time progress for all 7 SDLC agents.
    Persists final artifacts to DynamoDB upon completion.
    """
    auth_header = authorization or (f"Bearer {token}" if token else "Bearer demo-access-token")
    user = await get_current_user(auth_header)
    user_id = user["sub"]

    async def event_generator():
        async for step in run_sdlc_pipeline_stream(
            project_id=project_id,
            raw_prompt=prompt,
            user_id=user_id,
            project_title=title or "Digitano Generated SDLC Project"
        ):
            yield {
                "event": step.get("event", "agent_update"),
                "data": json.dumps(step.get("data", {}))
            }

    return EventSourceResponse(event_generator())


@app.get("/api/projects", summary="List User Projects from DynamoDB")
async def get_projects(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieves all projects saved for the authenticated user from DynamoDB."""
    user_id = current_user["sub"]
    items = dynamo_service.list_user_projects(user_id)
    return {"projects": items, "count": len(items)}


@app.get("/api/projects/{project_id}", summary="Get Specific Project Artifacts")
async def get_single_project(
    project_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Retrieves single project artifacts from DynamoDB by project_id."""
    user_id = current_user["sub"]
    item = dynamo_service.get_project(user_id, project_id)
    if not item:
        raise HTTPException(status_code=404, detail="Project not found")
    return item
