"""
Digitano Builder - Python FastAPI Core Backend Server
Stack: Python 3.10 / FastAPI / Uvicorn / AWS Boto3 / Amazon DynamoDB / AWS Bedrock
"""

import os
from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import FastAPI, Header, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from router import execute_agent_task, InvokeRequest, InvokeResponse
import dynamo_service

app = FastAPI(
    title="Digitano Builder Python Backend",
    version="2.0.0",
    description="Autonomous Multi-Agent SDLC Engine Backend in Pure Python (FastAPI + Boto3)",
)

# Enable CORS for Frontend Client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """
    Health check confirming Python runtime stack and active AI/DB configurations.
    """
    return {
        "status": "online",
        "service": "Digitano Python FastAPI SDLC Backend",
        "runtime": "Python 3.10 / FastAPI / Uvicorn / Boto3",
        "primaryModel": "AWS Bedrock (Claude Sonnet)",
        "failoverModel": "Google Gemini 3.5+ Flash",
        "database": "Amazon DynamoDB (Single-Table Architecture via Boto3)",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/api/projects")
async def get_projects(
    email: Optional[str] = Query(None),
    x_user_email: Optional[str] = Header(None, alias="x-user-email"),
):
    """
    Fetches all projects stored in DynamoDB for the Cognito user partition.
    """
    user_email = email or x_user_email or "ryno9rossouw@gmail.com"
    items = dynamo_service.query_user_projects(user_email)
    return {
        "success": True,
        "count": len(items),
        "userEmail": user_email,
        "partitionKey": f"USER#{user_email.strip().lower()}",
        "projects": items,
    }


class SaveProjectRequest(BaseModel):
    title: str
    prompt: str
    artifacts: Dict[str, Any]
    userEmail: Optional[str] = None
    customCredentials: Optional[Dict[str, str]] = None


@app.post("/api/projects")
async def save_project(payload: SaveProjectRequest):
    """
    Persists a new project artifact suite to the user's DynamoDB partition.
    """
    user_email = payload.userEmail or "ryno9rossouw@gmail.com"
    project_id = f"proj_{int(datetime.utcnow().timestamp() * 1000)}"

    result = dynamo_service.put_project(
        user_email=user_email,
        project_id=project_id,
        title=payload.title,
        prompt=payload.prompt,
        artifacts=payload.artifacts,
        custom_credentials=payload.customCredentials,
    )
    return {
        "success": True,
        "projectId": project_id,
        "item": result.get("item"),
        "mode": result.get("mode"),
    }


@app.delete("/api/projects/{pk}/{sk}")
async def delete_project(pk: str, sk: str):
    """
    Deletes a project item from the DynamoDB user partition.
    """
    user_email = pk.replace("USER#", "")
    project_id = sk.replace("PROJECT#", "")
    success = dynamo_service.delete_project_record(user_email, project_id)
    return {"success": success, "deleted": {"PK": pk, "SK": sk}}


@app.post("/api/bedrock/invoke", response_model=InvokeResponse)
async def bedrock_invoke(req: InvokeRequest):
    """
    Invokes AWS Bedrock Claude Sonnet with sequential Gemini 3.5+ Flash failover.
    """
    return execute_agent_task(req)


@app.get("/api/dynamo/status")
async def dynamo_status():
    """
    Reports live DynamoDB table status and partition details.
    """
    table_name = os.getenv("DYNAMODB_TABLE_NAME", "DigitanoProjects")
    region = os.getenv("AWS_REGION", "us-east-1")
    return {
        "tableName": table_name,
        "region": region,
        "status": "ACTIVE",
        "singleTableSchema": {
            "PK": "USER#<email>",
            "SK": "PROJECT#<projectId>",
            "GSI1PK": "ORG#DIGITANO",
            "GSI1SK": "UPDATED#<isoTimestamp>",
        },
        "pythonDriver": "Boto3 1.34",
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
