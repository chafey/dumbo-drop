#!/bin/sh
echo "Running Phase 2 - Create CAR Files"
export AWS_SDK_LOAD_CONFIG=1
export DUMBO_BLOCK_BUCKET=chafey-dumbo-drop-test-block
export DUMBO_CREATE_PART_LAMBDA=DumboDropStaging-GetCreatePart-1S80WISZLY2Z2
./cli.js create-parts chafey-dumbo-drop-test --concurrency 1
