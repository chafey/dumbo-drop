#!/bin/bash

echo "Resetting AWS"

#clear state files
rm -f .state*



# clear dynamodb
aws dynamodb delete-item \
    --table-name dumbo-v2-chafey-dumbo-drop-test \
    --key '{"url" : {"S": "https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR"}}'
aws dynamodb delete-item \
    --table-name dumbo-v2-chafey-dumbo-drop-test \
    --key '{"url" : {"S": "https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT2_J2KR"}}'
aws dynamodb delete-item \
    --table-name dumbo-v2-chafey-dumbo-drop-test \
    --key '{"url" : {"S": "https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/MG1_J2KR"}}'
aws dynamodb delete-item \
    --table-name dumbo-v2-chafey-dumbo-drop-test \
    --key '{"url" : {"S": "::split::https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/MG1_J2KR::0"}}'
aws dynamodb delete-item \
    --table-name dumbo-v2-chafey-dumbo-drop-test \
    --key '{"url" : {"S": "::split::https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/MG1_J2KR::1"}}'
aws dynamodb delete-item \
    --table-name dumbo-v2-chafey-dumbo-drop-test \
    --key '{"url" : {"S": "::split::https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/MG1_J2KR::2"}}'
aws dynamodb delete-item \
    --table-name commp2 \
    --key '{"key" : {"S": "bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci/bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci.car"},"bucket":{"S":"dumbo-v2-cars-chafey-dumbo-drop-test"}}'
aws dynamodb delete-item \
    --table-name commp2 \
    --key '{"key" : {"S": "bafyreifx6dt7edanljy7p3iqw6idsjzyepnwohbkmhnzrhjtdhxljioqdm/bafyreifx6dt7edanljy7p3iqw6idsjzyepnwohbkmhnzrhjtdhxljioqdm.car"},"bucket":{"S":"dumbo-v2-cars-chafey-dumbo-drop-test"}}'

#
if [ $( aws dynamodb scan --table-name commp2 --select "COUNT" | jq ".Count" ) == "0" ]
then
  if [ $( aws dynamodb scan --table-name dumbo-v2-chafey-dumbo-drop-test --select "COUNT" | jq ".Count" ) == "0" ]
  then
      echo "SUCCESS! DYNAMODB TABLES RESET"
  else
      echo "FAILURE! DYNAMODB TABLES NOT RESET"
  fi
else
    echo "FAILURE! DYNAMODB TABLES NOT RESET"
fi

#clear block bucket
aws s3 rm \
    s3://chafey-dumbo-drop-test-block \
    --recursive \
    --quiet
# clear car bucket
aws s3 rm \
    s3://dumbo-v2-cars-chafey-dumbo-drop-test \
    --recursive \
    --quiet

