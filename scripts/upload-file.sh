filename=8af6860c-d544-4a6f-abcd-49871dde7bbd.mp4

aws s3 cp sample.mp4 s3://mailauthorizer-content/files/$filename

aws s3api put-object \
  --bucket mailauthorizer-content \
  --key files/$filename \
  --metadata '{"filename":"sample.mp4","title":"Asian Skater Boys"}'

sls invoke --function postProcessing \
  --data '{"Records":[{"s3":{"object":{"key":"files/8af6860c-d544-4a6f-abcd-49871dde7bbd.mp4"}}}]}'

