filename=8af6860c-d544-4a6f-abcd-49871dde7bbd.mp4

aws s3 cp sample.mp4 s3://mailauthorizer-content/$filename
aws dynamodb put-item \
  --table-name files \
  --item '{
    "id": { "S": "1725059895044" },
    "title": { "S": "Asian Skater Boys" },
    "key": { "S": "$filename" }
  }' \
  --return-consumed-capacity TOTAL
