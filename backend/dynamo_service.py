"""
Digitano Builder - DynamoDB Persistence Service
Table: DigitanoProjects
Single-Table Schema:
  PK: USER#<cognito_sub_id>
  SK: PROJECT#<project_id>
"""

import os
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger("dynamo_service")
logger.setLevel(logging.INFO)

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "DigitanoProjects")

# Initialize DynamoDB resource
try:
    dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)
    table = dynamodb.Table(TABLE_NAME)
except Exception as e:
    logger.warning(f"Could not connect to AWS DynamoDB directly ({e}). Mock/fallback mode enabled if credentials are unset.")
    dynamodb = None
    table = None

# In-memory storage fallback for local development or sandbox runs without live AWS credentials
_IN_MEMORY_PROJECTS: Dict[str, Dict[str, Any]] = {}


def save_project_artifacts(
    user_id: str,
    project_id: str,
    project_title: str,
    artifacts_json: Dict[str, Any],
    initial_prompt: Optional[str] = None
) -> Dict[str, Any]:
    """
    Persists completed PRDs, database schemas, API contracts, and Vibe-Coder prompts
    into DynamoDB using Single-Table schema design:
      Partition Key (PK): USER#<cognito_sub_id>
      Sort Key (SK): PROJECT#<project_id>
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    pk = f"USER#{user_id}"
    sk = f"PROJECT#{project_id}"

    item = {
        "PK": pk,
        "SK": sk,
        "user_id": user_id,
        "project_id": project_id,
        "project_title": project_title,
        "initial_prompt": initial_prompt or "",
        "artifacts": artifacts_json,
        "created_at": now_iso,
        "updated_at": now_iso,
        "status": "COMPLETED",
        "type": "PROJECT"
    }

    if table is not None and os.getenv("AWS_ACCESS_KEY_ID"):
        try:
            logger.info(f"Writing to DynamoDB: {pk} / {sk}")
            table.put_item(Item=item)
            return {"success": True, "persisted": "dynamodb", "item": item}
        except ClientError as e:
            logger.error(f"DynamoDB PutItem error: {e.response['Error']['Message']}")
            # Cache locally as safety fallback
            _IN_MEMORY_PROJECTS[f"{pk}::{sk}"] = item
            return {"success": True, "persisted": "fallback_cache", "warning": str(e), "item": item}
    else:
        logger.info(f"Saving project {project_id} to in-memory fallback store.")
        _IN_MEMORY_PROJECTS[f"{pk}::{sk}"] = item
        return {"success": True, "persisted": "in_memory", "item": item}


def get_project(user_id: str, project_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single project by user_id and project_id."""
    pk = f"USER#{user_id}"
    sk = f"PROJECT#{project_id}"

    if table is not None and os.getenv("AWS_ACCESS_KEY_ID"):
        try:
            response = table.get_item(Key={"PK": pk, "SK": sk})
            return response.get("Item")
        except ClientError as e:
            logger.error(f"DynamoDB GetItem error: {e}")
            return _IN_MEMORY_PROJECTS.get(f"{pk}::{sk}")
    return _IN_MEMORY_PROJECTS.get(f"{pk}::{sk}")


def list_user_projects(user_id: str) -> List[Dict[str, Any]]:
    """Queries all projects belonging to a user (PK = USER#<user_id>)."""
    pk = f"USER#{user_id}"

    if table is not None and os.getenv("AWS_ACCESS_KEY_ID"):
        try:
            from boto3.dynamodb.conditions import Key
            response = table.query(
                KeyConditionExpression=Key("PK").eq(pk) & Key("SK").begins_with("PROJECT#")
            )
            return response.get("Items", [])
        except ClientError as e:
            logger.error(f"DynamoDB Query error: {e}")

    # Fallback search in memory
    results = [
        val for key, val in _IN_MEMORY_PROJECTS.items()
        if key.startswith(f"{pk}::PROJECT#")
    ]
    results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return results
