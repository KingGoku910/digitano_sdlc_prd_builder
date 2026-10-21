"""Storage tools for intermediate agent data and final artifacts."""
import os
import json
try:
    import boto3
except ImportError:
    boto3 = None
from datetime import datetime, timezone
from typing import Dict, List, Any
from config.settings import settings

_s3 = None
try:
    if boto3 and os.environ.get("AWS_ACCESS_KEY_ID") and os.environ.get("AWS_SECRET_ACCESS_KEY"):
        _s3 = boto3.client("s3", region_name=settings.AWS_REGION)
except Exception:
    _s3 = None

BUCKET = settings.KB_S3_BUCKET

# Local fallback storage directories
LOCAL_BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".storage")
LOCAL_INTERMEDIATE_DIR = os.path.join(LOCAL_BASE_DIR, "intermediate")
LOCAL_ARTIFACTS_DIR = os.path.join(LOCAL_BASE_DIR, "artifacts")
os.makedirs(LOCAL_INTERMEDIATE_DIR, exist_ok=True)
os.makedirs(LOCAL_ARTIFACTS_DIR, exist_ok=True)

def _project_prefix(project_id: str) -> str:
    """Returns the S3 prefix for a given project's working data."""
    return f"projects/{project_id}/"

def save_intermediate(project_id: str, stage: str, data: dict) -> str:
    """
    Persist an agent's intermediate output to S3 so downstream
    agents can read it in the same pipeline run.
    Falls back to local file storage if S3 is unavailable.
    """
    if stage.endswith(".json"):
        stage = stage[:-5]

    key = f"{_project_prefix(project_id)}{stage}.json"
    payload = {
        "project_id": project_id,
        "stage": stage,
        "saved_at": datetime.now(timezone.utc).isoformat(),
        "data": data,
    }

    # 1. Attempt S3 if configured
    if _s3:
        try:
            _s3.put_object(
                Bucket=BUCKET,
                Key=key,
                Body=json.dumps(payload, indent=2),
                ContentType="application/json",
            )
            return key
        except Exception as e:
            pass

    # 2. Seamless local fallback
    local_path = os.path.join(LOCAL_INTERMEDIATE_DIR, f"{project_id}_{stage}.json")
    with open(local_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    return key

def read_intermediate(project_id: str, stage: str) -> dict:
    """
    Read a previously saved intermediate output from S3 or local fallback.
    """
    if stage.endswith(".json"):
        stage = stage[:-5]

    key = f"{_project_prefix(project_id)}{stage}.json"
    if _s3:
        try:
            response = _s3.get_object(Bucket=BUCKET, Key=key)
            payload = json.loads(response["Body"].read().decode("utf-8"))
            return payload.get("data", {})
        except Exception:
            pass

    # Local fallback
    local_path = os.path.join(LOCAL_INTERMEDIATE_DIR, f"{project_id}_{stage}.json")
    if os.path.exists(local_path):
        try:
            with open(local_path, "r", encoding="utf-8") as f:
                payload = json.load(f)
                return payload.get("data", {})
        except Exception:
            return {}

    return {}

def list_project_stages(project_id: str) -> List[str]:
    """
    List all stages that have been saved for a given project.
    """
    prefix = _project_prefix(project_id)
    stages = []
    if _s3:
        try:
            response = _s3.list_objects_v2(Bucket=BUCKET, Prefix=prefix)
            for obj in response.get("Contents", []):
                key = obj["Key"]
                stage_name = key.replace(prefix, "").replace(".json", "")
                if stage_name:
                    stages.append(stage_name)
            if stages:
                return stages
        except Exception:
            pass

    # Local fallback
    prefix_local = f"{project_id}_"
    for fname in os.listdir(LOCAL_INTERMEDIATE_DIR):
        if fname.startswith(prefix_local) and fname.endswith(".json"):
            stages.append(fname[len(prefix_local):-5])

    return stages

def save_artifact(project_id: str, artifact_type: str, content: str) -> str:
    """
    Saves an assembled artifact (Markdown) to S3 or local directory.
    """
    key = f"{_project_prefix(project_id)}artifacts/{artifact_type}.md"
    if _s3:
        try:
            _s3.put_object(
                Bucket=BUCKET,
                Key=key,
                Body=content.encode("utf-8"),
                ContentType="text/markdown",
            )
            return key
        except Exception:
            pass

    # Local fallback
    local_path = os.path.join(LOCAL_ARTIFACTS_DIR, f"{project_id}_{artifact_type}.md")
    with open(local_path, "w", encoding="utf-8") as f:
        f.write(content)

    return key

__all__ = [
    "save_intermediate",
    "read_intermediate",
    "list_project_stages",
    "save_artifact",
]
