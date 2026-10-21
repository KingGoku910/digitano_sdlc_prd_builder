"""DynamoDB project status and metadata service with local JSON fallback."""
import os
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
try:
    import boto3
except ImportError:
    boto3 = None
from config.settings import settings

DYNAMODB_STORE_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "dynamodb_store.json"
)

_dynamo_client = None
try:
    if boto3 and os.environ.get("AWS_ACCESS_KEY_ID") and os.environ.get("AWS_SECRET_ACCESS_KEY"):
        _dynamo_client = boto3.client("dynamodb", region_name=settings.AWS_REGION)
except Exception:
    _dynamo_client = None

async def update_project_status(
    user_email: str,
    project_id: str,
    status: str,
    presigned_urls: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Updates the execution status of a project in DynamoDB and local JSON store.
    """
    timestamp = datetime.now(timezone.utc).isoformat()
    clean_email = (user_email or "system@digitano.io").lower().strip()
    pk = f"USER#{clean_email}"
    sk = f"PROJ#{project_id}"

    # 1. Update local persistent storage
    try:
        memory_store = {}
        if os.path.exists(DYNAMODB_STORE_FILE):
            with open(DYNAMODB_STORE_FILE, "r", encoding="utf-8") as f:
                memory_store = json.load(f)

        if pk not in memory_store:
            memory_store[pk] = {}

        if sk not in memory_store[pk]:
            memory_store[pk][sk] = {
                "projectId": project_id,
                "userEmail": clean_email,
                "createdAt": timestamp,
            }

        memory_store[pk][sk]["status"] = status
        memory_store[pk][sk]["updatedAt"] = timestamp
        if presigned_urls:
            memory_store[pk][sk]["artifactUrls"] = presigned_urls

        with open(DYNAMODB_STORE_FILE, "w", encoding="utf-8") as f:
            json.dump(memory_store, f, indent=2)
    except Exception as e:
        print(f"[DynamoDB Local] Error persisting status: {e}")

    # 2. Update AWS DynamoDB if available
    if _dynamo_client:
        try:
            _dynamo_client.update_item(
                TableName=settings.DYNAMODB_TABLE_NAME,
                Key={
                    "PK": {"S": pk},
                    "SK": {"S": sk}
                },
                UpdateExpression="SET #st = :s, #ua = :t",
                ExpressionAttributeNames={
                    "#st": "status",
                    "#ua": "updatedAt"
                },
                ExpressionAttributeValues={
                    ":s": {"S": status},
                    ":t": {"S": timestamp}
                }
            )
        except Exception:
            pass

    return {
        "project_id": project_id,
        "status": status,
        "updated_at": timestamp
    }

__all__ = ["update_project_status"]
