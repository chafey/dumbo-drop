#!/bin/bash

export DUMBO_DROP_SMOKE_TEST=1
scripts/reset.sh
scripts/parsebucket.sh
scripts/createparts.sh
scripts/commp.sh

if (curl --output /dev/null --silent --head --fail https://dumbo-v2-cars-chafey-dumbo-drop-test.s3-us-west-2.amazonaws.com/bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci/bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci.car &&
   curl --output /dev/null --silent --head --fail https://dumbo-v2-cars-chafey-dumbo-drop-test.s3-us-west-2.amazonaws.com/bafyreifx6dt7edanljy7p3iqw6idsjzyepnwohbkmhnzrhjtdhxljioqdm/bafyreifx6dt7edanljy7p3iqw6idsjzyepnwohbkmhnzrhjtdhxljioqdm.car) ||
   (curl --output /dev/null --silent --head --fail https://dumbo-v2-cars-chafey-dumbo-drop-test.s3-us-west-2.amazonaws.com/bafyreid5nxtzuq43rfyjqdjppsepiauhp3c6h4xz2a6ffylbjzyumwatt4/bafyreid5nxtzuq43rfyjqdjppsepiauhp3c6h4xz2a6ffylbjzyumwatt4.car &&
   curl --output /dev/null --silent --head --fail https://dumbo-v2-cars-chafey-dumbo-drop-test.s3-us-west-2.amazonaws.com/bafyreifx6dt7edanljy7p3iqw6idsjzyepnwohbkmhnzrhjtdhxljioqdm/bafyreifx6dt7edanljy7p3iqw6idsjzyepnwohbkmhnzrhjtdhxljioqdm.car)
then
    COMMPCOUNT=$(aws dynamodb scan --table-name commp2 --select "COUNT" | jq ".Count")
    if [ $COMMPCOUNT == "2" ]
    then
        echo "SUCCESS! CAR FILES AND COMMP FOUND"
    else
        echo "FAILURE! CAR FILES FOUND, BUT NOT COMMP"
    fi
else
    echo "FAILURE! CAR FILES NOT FOUND"
fi

