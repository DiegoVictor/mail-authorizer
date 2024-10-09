awslocal ses verify-email-identity --email $NOREPLY_EMAIL_ADDRESS

awslocal ses list-identities

awslocal dynamodb create-table \
  --table-name totp \
  --key-schema AttributeName=email,KeyType=HASH \
  --attribute-definitions AttributeName=email,AttributeType=S \
  --region $REGION \
  --billing-mode PAY_PER_REQUEST

awslocal dynamodb create-table \
  --table-name files \
  --key-schema AttributeName=id,KeyType=HASH AttributeName=createdAt,KeyType=RANGE\
  --attribute-definitions AttributeName=id,AttributeType=S AttributeName=type,AttributeType=S AttributeName=createdAt,AttributeType=N \
  --global-secondary-indexes \
    '[
      {
        "IndexName": "TypeIndex",
        "KeySchema": [
          { "AttributeName": "type", "KeyType": "HASH" },
          { "AttributeName": "createdAt", "KeyType": "RANGE" }
        ],
        "Projection": {
          "ProjectionType": "ALL"
        }
      }
    ]' \
  --region $REGION \
  --billing-mode PAY_PER_REQUEST

awslocal dynamodb list-tables \
  --region $REGION

awslocal dynamodb scan \
  --table-name files \
  --region $REGION

awslocal s3api create-bucket --bucket mailauthorizer-content

awslocal s3api list-buckets

awslocal s3 cp /var/lib/localstack/scripts/sample.mp4 s3://mailauthorizer-content/files/8af6860c-d544-4a6f-abcd-49871dde7bbd.mp4

awslocal s3api list-objects --bucket mailauthorizer-content

# Use this if you need manually trigger the postProcessing function
# sls invoke local --function postProcessing \
#   --env IS_OFFLINE=true \
#   --data '{"Records":[{"s3":{"object":{"key":"files/8af6860c-d544-4a6f-abcd-49871dde7bbd.mp4"}}}]}'

awslocal dynamodb put-item \
  --table-name files \
  --item '{
    "id": { "S": "0b6b0221-45c5-4ba9-ad2b-300b64c72d17" },
    "type": { "S": "VIDEO" },
    "title": { "S": "Asian Skater Boys" },
    "key": { "S": "files/8af6860c-d544-4a6f-abcd-49871dde7bbd.mp4" },
    "createdAt": { "N": "1725059895044" }
  }' \
  --region $REGION

awslocal dynamodb scan --table-name files

awslocal secretsmanager create-secret \
    --name mailauthorizer-cloudfront-private-key \
    --secret-string 'Fake Private Key'

awslocal secretsmanager get-secret-value \
    --secret-id mailauthorizer-cloudfront-private-key
