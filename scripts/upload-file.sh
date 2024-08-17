filename=8af6860c-d544-4a6f-abcd-49871dde7bbd.mp4

aws s3 cp sample.mp4 s3://mailauthorizer-content/$filename
aws dynamodb put-item \
  --table-name file \
  --item '{
    "id": {
      "S": "34140420-f761-418f-9a29-817204f7ea9d"
    },
    "name": {
      "S": "$filename"
    },
    createdAt: {
      "S": "2024-08-16T10:00:00Z"
    }
  }' \
  --return-consumed-capacity TOTAL
