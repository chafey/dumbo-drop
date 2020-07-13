#!/bin/sh
rm -f createparts.json
aws lambda invoke \
  --cli-binary-format raw-in-base64-out \
  --function-name DumboDropStaging-GetCreatePartV2-1AIKL2H131V5G \
  --payload '{"query": {"files":["https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR"],"blockBucket": "chafey-dump-drop-test-block2","Bucket":"dumbo-v2-cars-chafey-dumbo-drop-test"}}' \
  createparts.json
cat createparts.json
