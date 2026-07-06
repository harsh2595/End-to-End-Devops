#!/usr/bin/env bash
set -euo pipefail

STATE_BUCKET_NAME="harsh-end-to-end-devops-tf-state"
LOCK_TABLE_NAME="end-to-end-devops-tf-locks"

echo "Destroying Stage 6 bootstrap resources..."
echo "S3 bucket: ${STATE_BUCKET_NAME}"
echo "DynamoDB table: ${LOCK_TABLE_NAME}"

bucket_deleted=false
table_deleted=false

if aws s3api head-bucket --bucket "${STATE_BUCKET_NAME}" 2>/dev/null; then
  echo "Checking bucket contents..."
  echo "Deleting all object versions and delete markers..."
  aws s3api list-object-versions \
    --bucket "${STATE_BUCKET_NAME}" \
    --output json \
    | jq -r '
        [
          (.Versions[]? | {Key, VersionId}),
          (.DeleteMarkers[]? | {Key, VersionId})
        ]
        | .[]
        | @base64
      ' \
    | while read -r encoded; do
        item=$(printf '%s' "${encoded}" | base64 --decode)
        key=$(printf '%s' "${item}" | jq -r '.Key')
        version_id=$(printf '%s' "${item}" | jq -r '.VersionId')
        aws s3api delete-object \
          --bucket "${STATE_BUCKET_NAME}" \
          --key "${key}" \
          --version-id "${version_id}" >/dev/null
      done

  echo "Deleting bucket..."
  aws s3api delete-bucket --bucket "${STATE_BUCKET_NAME}"
else
  echo "Bucket already deleted or not accessible, skipping."
fi

if aws dynamodb describe-table --table-name "${LOCK_TABLE_NAME}" >/dev/null 2>&1; then
  echo "Deleting DynamoDB table..."
  aws dynamodb delete-table --table-name "${LOCK_TABLE_NAME}"

  echo "Waiting for DynamoDB table deletion..."
  aws dynamodb wait table-not-exists --table-name "${LOCK_TABLE_NAME}"
else
  echo "DynamoDB table already deleted or not accessible, skipping."
fi

if ! aws s3api head-bucket --bucket "${STATE_BUCKET_NAME}" 2>/dev/null; then
  bucket_deleted=true
fi

if ! aws dynamodb describe-table --table-name "${LOCK_TABLE_NAME}" >/dev/null 2>&1; then
  table_deleted=true
fi

echo "Verification:"
if [[ "${bucket_deleted}" == "true" ]]; then
  echo "S3 bucket destroyed: ${STATE_BUCKET_NAME}"
else
  echo "S3 bucket still exists: ${STATE_BUCKET_NAME}"
fi

if [[ "${table_deleted}" == "true" ]]; then
  echo "DynamoDB table destroyed: ${LOCK_TABLE_NAME}"
else
  echo "DynamoDB table still exists: ${LOCK_TABLE_NAME}"
fi

if [[ "${bucket_deleted}" == "true" && "${table_deleted}" == "true" ]]; then
  echo "S3 and DynamoDB destroyed successfully."
else
  echo "Cleanup incomplete."
fi

echo "Stage 6 bootstrap resources destroyed."
