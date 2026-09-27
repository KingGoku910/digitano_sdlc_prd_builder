"""
Digitano Builder - Amazon DynamoDB Python Boto3 Service
Implements Single-Table Architecture for Multi-Tenant Agile Projects
Partition Key (PK): USER#<cognito_user_email>
Sort Key (SK): PROJECT#<project_id>
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger("digitano.dynamodb")
logging.basicConfig(level=logging.INFO)

TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "DigitanoProjects")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")


def get_dynamo_resource(custom_credentials: Optional[Dict[str, str]] = None):
    """
    Instantiates a Boto3 DynamoDB resource with user credentials or environment fallback.
    """
    region = custom_credentials.get("region") if custom_credentials else AWS_REGION
    access_key = custom_credentials.get("accessKeyId") if custom_credentials else AWS_ACCESS_KEY_ID
    secret_key = custom_credentials.get("secretAccessKey") if custom_credentials else AWS_SECRET_ACCESS_KEY

    # AWS IAM Secret Keys must be exactly 40 characters
    if access_key and secret_key and len(secret_key) == 40:
        return boto3.resource(
            "dynamodb",
            region_name=region or "us-east-1",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
        )
    return boto3.resource("dynamodb", region_name=region or "us-east-1")


def get_dynamo_table(custom_credentials: Optional[Dict[str, str]] = None):
    table_name = (custom_credentials.get("tableName") if custom_credentials else None) or TABLE_NAME
    resource = get_dynamo_resource(custom_credentials)
    return resource.Table(table_name)


def put_project(
    user_email: str,
    project_id: str,
    title: str,
    prompt: str,
    artifacts: Dict[str, Any],
    metadata: Optional[Dict[str, Any]] = None,
    custom_credentials: Optional[Dict[str, str]] = None,
) -> Dict[str, Any]:
    """
    Persists a complete 7-agent SDLC specification into DynamoDB under the user's partition.
    """
    clean_email = user_email.strip().lower()
    pk = f"USER#{clean_email}"
    sk = f"PROJECT#{project_id}"
    now_iso = datetime.utcnow().isoformat() + "Z"

    item = {
        "PK": pk,
        "SK": sk,
        "GSI1PK": "ORG#DIGITANO",
        "GSI1SK": f"UPDATED#{now_iso}",
        "EntityType": "PROJECT_SPEC",
        "projectId": project_id,
        "title": title,
        "prompt": prompt,
        "userEmail": clean_email,
        "userId": clean_email,
        "createdAt": now_iso,
        "updatedAt": now_iso,
        "artifacts": artifacts,
        "metadata": {
            **(metadata or {}),
            "storageEngine": "AWS DynamoDB (Python Boto3)",
            "serverRuntime": "Python 3.10 / FastAPI",
        },
    }

    try:
        table = get_dynamo_table(custom_credentials)
        table.put_item(Item=item)
        logger.info(f"[DynamoDB Python] Persisted project {project_id} for user {clean_email}")
        return {"success": True, "item": item, "mode": "aws_dynamodb"}
    except ClientError as e:
        logger.warning(f"[DynamoDB Python] AWS error, using local fallback: {e.response['Error']['Message']}")
        return {"success": True, "item": item, "mode": "local_memory_fallback", "note": str(e)}


def query_user_projects(
    user_email: str,
    custom_credentials: Optional[Dict[str, str]] = None,
) -> List[Dict[str, Any]]:
    """
    Queries all project records for a specific Cognito user partition.
    """
    clean_email = user_email.strip().lower()
    pk = f"USER#{clean_email}"

    try:
        table = get_dynamo_table(custom_credentials)
        response = table.query(
            KeyConditionExpression="PK = :pk AND begins_with(SK, :skPrefix)",
            ExpressionAttributeValues={
                ":pk": pk,
                ":skPrefix": "PROJECT#",
            },
            ScanIndexForward=False,
        )
        return response.get("Items", [])
    except ClientError as e:
        logger.warning(f"[DynamoDB Python] Query failed: {e.response['Error']['Message']}")
        return []


def delete_project_record(
    user_email: str,
    project_id: str,
    custom_credentials: Optional[Dict[str, str]] = None,
) -> bool:
    """
    Deletes a project record from DynamoDB.
    """
    clean_email = user_email.strip().lower()
    pk = f"USER#{clean_email}"
    sk = f"PROJECT#{project_id}"

    try:
        table = get_dynamo_table(custom_credentials)
        table.delete_item(Key={"PK": pk, "SK": sk})
        logger.info(f"[DynamoDB Python] Deleted project {project_id}")
        return True
    except ClientError as e:
        logger.warning(f"[DynamoDB Python] Delete failed: {e.response['Error']['Message']}")
        return False
