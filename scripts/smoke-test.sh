#!/bin/bash

export DUMBO_DROP_SMOKE_TEST=1
scripts/reset.sh
scripts/parsebucket.sh
scripts/createparts.sh

if curl --output /dev/null --silent --head --fail https://dumbo-v2-cars-chafey-dumbo-drop-test.s3-us-west-2.amazonaws.com/bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci/bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci.car; then
    if curl --output /dev/null --silent --head --fail https://dumbo-v2-cars-chafey-dumbo-drop-test.s3-us-west-2.amazonaws.com/bafyreifx6dt7edanljy7p3iqw6idsjzyepnwohbkmhnzrhjtdhxljioqdm/bafyreifx6dt7edanljy7p3iqw6idsjzyepnwohbkmhnzrhjtdhxljioqdm.car; then
        echo "SUCCESS! CAR FILES FOUND"
    else
        echo "FAILURE! CAR FILES NOT FOUND"
    fi
else
    echo "FAILURE! CAR FILES NOT FOUND"
fi
