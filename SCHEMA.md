# Schema Documentation

Two DynamoDB tables are used for Dumbo Drop processing.  A table dedicated to a source s3 bucket of files "BucketTable" and
a shared commp table which holds commp calculations for car files from multiple source s3 buckets "CommpTable".

## BucketTable

Used to store information about source files and resulting CAR Files

* Primary partition key: url (String)
* Primary sort key: - (none)

| Name      | Type     | Description 
| --------- | -------- | ----------- 
| url       | String   | URL to the source file or `::split::${url}::${i}` where i is zero based split number and url is the source file 
| dataset   | String   | the S3 bucket name that contains the original file
| size      | Number   | the size of the file or split
| parts     | [String] | ordered list of IPLD block CIDs (base58) for this file or split
| split     | Boolean  | true if this source file > 912 MB and therefore split, undefined/missing if not split
| carUrl    | String   | url to generated car file.  Not present before phase 2 processing
| root      | []       | 3 values - Filecoin payloadCid (base32), offset of unixFSV1 File CID in payload, unixFSFV1 File CID (base32).  

## CommPTable

Used to store the results of CommP calculation for CAR Files

* Primary partition key: key (String)
* Primary sort key: bucket (String)

| Name      | Type     | Description 
| --------- | -------- | ----------- 
| key       | String   | S3 Key to a CARFile (e.g. $CARCID/$CARCID.car) 
| bucket    | String   | S3 Bucket for the CAR File 
| region    | String   | the AWS region of the bucket 
| size      | Number   | The size of the CAR file 
| paddedSize| Number   | The padded size for the CAR file after fr32 padding 
| pieceSize | Number   | The piece size for the CAR file 
| root      | String   | Filecoin payloadCid (root CID in CAR file) 
