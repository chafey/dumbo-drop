#!/bin/sh
echo "Running Phase 3 - Generate COMMP for CAR Files"
export AWS_SDK_LOAD_CONFIG=1
export DUMBO_COMMP_TABLE=commp2
./cli.js commp dumbo-v2-cars-chafey-dumbo-drop-test --concurrency 1
