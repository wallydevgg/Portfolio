import boto3
from botocore.client import Config
from core.config import settings

PUBLIC_READ_POLICY = """{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Effect":"Allow",
      "Principal":"*",
      "Action":"s3:GetObject",
      "Resource":"arn:aws:s3:::""" + settings.MINIO_BUCKET + """/*"
    }
  ]
}"""

def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=f"http://{settings.MINIO_ENDPOINT}",
        aws_access_key_id=settings.MINIO_ROOT_USER,
        aws_secret_access_key=settings.MINIO_ROOT_PASSWORD,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )

def ensure_bucket():
    try:
        client = get_s3_client()
        buckets = [b["Name"] for b in client.list_buckets()["Buckets"]]

        if settings.MINIO_BUCKET not in buckets:
            client.create_bucket(Bucket=settings.MINIO_BUCKET)

        client.put_bucket_policy(Bucket=settings.MINIO_BUCKET, Policy=PUBLIC_READ_POLICY)
    except Exception as e:
        print(f"Warning: Could not ensure MinIO bucket: {e}")

def upload_file(file_data: bytes, file_name: str) -> str:
    """Upload file to MinIO and return public URL."""
    try:
        client = get_s3_client()
        client.put_object(
            Bucket=settings.MINIO_BUCKET,
            Key=file_name,
            Body=file_data,
            ContentType="image/jpeg"
        )
        return f"{settings.MINIO_PUBLIC_URL}/{settings.MINIO_BUCKET}/{file_name}"
    except Exception as e:
        raise Exception(f"Failed to upload file to MinIO: {str(e)}")

def delete_file(file_name: str) -> bool:
    """Delete file from MinIO."""
    try:
        client = get_s3_client()
        client.delete_object(Bucket=settings.MINIO_BUCKET, Key=file_name)
        return True
    except Exception as e:
        print(f"Warning: Could not delete file from MinIO: {e}")
        return False
