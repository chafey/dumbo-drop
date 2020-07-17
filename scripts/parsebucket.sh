#!/bin/sh
echo "Running Phase 1 - Parse Bucket"
export AWS_SDK_LOAD_CONFIG=1
export DUMBO_PARSE_FILE_LAMBDA=DumboDropStaging-GetParseFiles-1AZEMWF0OTWFU
export DUMBO_BLOCK_BUCKET=chafey-dumbo-drop-test-block
export DUMBO_DROP_SMOKE_TEST=1
./cli.js pull-bucket chafey-dumbo-drop-test --concurrency 1
