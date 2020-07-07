#!/bin/sh
rm -f .state*
export AWS_SDK_LOAD_CONFIG=1
export DUMBO_BLOCK_BUCKET=chafey-dumbo-drop-test-block
export DUMBO_CREATE_PART_LAMBDA=InitStaging-GetCreatePartV2-1Z8TBEE006I6
./cli.js create-parts-v2 chafey-dumbo-drop-test --concurrency 1
