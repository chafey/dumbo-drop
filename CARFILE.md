# CAR File 

The DumboDrop project encodes source files from an S3 bucket into UnixFSV1 Files stored in Filecoin CAR files.

## Notes

* The maximum size of a Filecoin CAR file is 1GB.  Since this 1GB must include space for encoding overhead (UnixFSV1, CAR) and FR32 padding
* Source files < 912MB are always stored as a single UnixFSV1 File
* Source files >= 912MB are split into multiple UnixFSV1 files of size 912MB.
  * The filename for each split is `::split::${url}::${i}` where i is the split number (0 based) and url is the source file url 
  * Each split of size 912MB is stored in its own CAR file
  * The last split may be combined into a CAR file with smaller source files
* Filecoin CAR Files have a single root. 
  * The CID for this root is also known as the Filecoin PayloadCid
* DumboDrop uses the Filecoin PayloadCid as the filename for the generated CAR file
* The Filecoin Payload is a dag-cbor encoded array of UnixFSV1 File CIDs

## Example

### Source Files

| Filename       | Size     |
| -------------- | -------- |
| README.md      | 10KB     |
| FunnyMeme.jpeg | 2MB      |
| TheMatrix.mpeg | 1.5GB    |


### UnixFSV1 Files

| Filename                   | CID                                               | Size   |
| -------------------------- | ------------------------------------------------- | ------ |
| README.md                  | mAVUSIJViD/PQ5QYiaFNQfUpExLesbcSf0d0TRg7ZekfhhK0D | 10KB   |
| FunnyMeme.jpeg             | mAVUSIBIfd3Bfjibu+qyv4Ne+zI3ULJtVU+PcuQQoPZqWyfFq | 2MB    |
| ::split::TheMatrix.mpeg::0 | mAVUSIOCS5sGDcqo+KTdHYzOxhw8DPspKgvkj9jUTUlj1FTx2 | 912MB  |
| ::split::TheMatrix.mpeg::1 | mAVUSIDka3ljTJS76DJIkjXtVsrIHMkl80RoSUo9HEAUUVbfN | .5MB   |


### CAR File #1

Contains first 912MB of TheMatrix.mpeg

``` JavaScript
Root: [
    "mAVUSIOCS5sGDcqo+KTdHYzOxhw8DPspKgvkj9jUTUlj1FTx2", // ::split::TheMatrix.mpeg::0
]
```

### CAR File #2

Contains README.md, FunnyMeme.jpeg and remaining bytes of TheMatrix.mpeg
``` JavaScript
Root: [
    "mAVUSIDka3ljTJS76DJIkjXtVsrIHMkl80RoSUo9HEAUUVbfN", // ::split::TheMatrix.mpeg::1
    "mAVUSIJViD/PQ5QYiaFNQfUpExLesbcSf0d0TRg7ZekfhhK0D", // README.md
    "mAVUSIBIfd3Bfjibu+qyv4Ne+zI3ULJtVU+PcuQQoPZqWyfFq" // FunnyMeme.md
]
```

```
------------------------------    ------------------------------
| CAR File #1                |    | CAR File #2                |
|----------------------------|    |----------------------------|
| Root                       |    | Root                       |
|----------------------------|    |----------------------------|
| ::split::TheMatrix.mpeg::0 |    | ::split::TheMatrix.mpeg::1 |
------------------------------    | README.md                  |
                                  | FunnyMeme.jpeg             |
                                  ------------------------------

```



## Related Information

* [CAR File Specification](https://github.com/ipld/specs/blob/7ffdb0c98af6d0a0a3d3e334e6c9606abb4cf62e/block-layer/content-addressable-archives.md)
* [UnixFSV1 Specification](https://nmb48.top/ipfs/specs/blob/master/UNIXFS.md)
* [Filecoin Specification](https://filecoin-project.github.io/specs/)




