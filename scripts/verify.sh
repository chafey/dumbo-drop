#!/bin/sh
export AWS_SDK_LOAD_CONFIG=1
export DUMBO_DROP_SMOKE_TEST=1
./cli.js verify chafey-dumbo-drop-test --concurrency 1
