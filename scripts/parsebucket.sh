#!/bin/sh
export AWS_SDK_LOAD_CONFIG=1
export DUMBO_PARSE_FILE_LAMBDA=InitStaging-GetParseFileV2-1PEGY7GD0G8V2
export DUMBO_BLOCK_STORE=chafey-dumbo-drop-test-block
./cli.js pull-bucket-v2 chafey-dumbo-drop-test --concurrency 1
