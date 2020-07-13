#!/bin/sh
rm -f parsebucket.out
aws lambda invoke \
  --cli-binary-format raw-in-base64-out \
  --function-name DumboDropStaging-GetParseFileV2-Q8HR0YBN5TEX \
  --payload '{"query": {"urls":["https://chafey-dumbo-drop-test.s3-us-west-2.amazonaws.com/CT1_J2KR"],"blockBucket": "chafey-dumbo-drop-test-block"}}' \
  parsebucket.out
cat parsebucket.out
