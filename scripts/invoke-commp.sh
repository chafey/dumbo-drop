#!/bin/sh
rm -f commp.json
aws lambda invoke \
  --cli-binary-format raw-in-base64-out \
  --function-name commpFromCarFile \
  --payload '{"region": "us-west-2", "bucket": "dumbo-v2-cars-chafey-dumbo-drop-test", "key": "bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci/bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci.car"}' \
  commp.json
cat commp.json
