#!/bin/sh
export AWS_SDK_LOAD_CONFIG=1
export DUMBO_PARSE_FILE_LAMBDA=DumboDropStaging-GetParseFileV2-Q8HR0YBN5TEX
export DUMBO_BLOCK_STORE=chafey-dumbo-drop-test-block
./cli.js pull-bucket-v2 chafey-dumbo-drop-test --concurrency 1
