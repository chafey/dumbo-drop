#!/bin/sh
rm -f .state*
export AWS_SDK_LOAD_CONFIG=1
export DUMBO_BLOCK_BUCKET=chafey-dumbo-drop-test-block
export DUMBO_CREATE_PART_LAMBDA=DumboDropStaging-GetCreatePartV2-1AIKL2H131V5G
./cli.js create-parts-v2 chafey-dumbo-drop-test --concurrency 1
