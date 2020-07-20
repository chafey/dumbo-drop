// 912 MB is the maximum car file size as we cannot exceed 1GB per CAR file
// and need space for CAR file overhead, unixfsv2 overhead, and padding
// needed for commp generation 
const MAX_CAR_FILE_SIZE = 1024 * 1024 * 912
//const MAX_CAR_FILE_SIZE = 1024 * 1024 * 4

// The maximum number of files per CAR file is 2000 because that is the maximum
// number of files we can store in the CAR header
const MAX_CAR_FILES = 2000

// We use a maximum block size of 1MB because that was the limit in IPFS
// bitswap (at least in the past)
const MAX_BLOCK_SIZE = 1024 * 1024

module.exports = {
    MAX_CAR_FILE_SIZE,
    MAX_CAR_FILES,
    MAX_BLOCK_SIZE
}