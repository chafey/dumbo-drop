const saveFile = require('./save-file')
const executeParseFiles = require('./execute-parse-files')

// parses a file by invoking the lambda function to read the file,
// chunk it into IPLD blocks, store those blocks in S3 and write
// the resulting info (including CIDs) into dynamo.
// If the file size exceeds a certain
// limit, then it is split into multiple pieces in dynamo to work around
// a data size limit in dynamo
const parseFile = async (db, url, size, limits, parameters) => {
  let parts = []
  if (size < limits.MAX_CAR_FILE_SIZE) {
    let opts = { urls: [url], blockBucket: parameters.blockBucket }
    const result = await executeParseFiles(opts, parameters)
    const parts = result[url]
    const resp = await saveFile.saveFile(db, url, parameters.bucket, parts, size)
    return resp
  } else {
    let i = 0
    const splits = []
    while (i < size) {
      opts = { urls: [url], headers: { Range: `bytes=${i}-${(i + limits.MAX_CAR_FILE_SIZE) - 1}` }, blockBucket: parameters.blockBucket }
      const result = await executeParseFiles(opts, parameters)
      const chunks = result[url]
      splits.push(chunks)
      i += limits.MAX_CAR_FILE_SIZE
    }
    const resp = await saveFile.saveSplits(db, url, parameters.bucket, splits, size, limits)
    return resp
  }
}

// batch interface for parsing multiple small files into IPLD blocks stored in S3
// using a lambda function and saving resulting CIDs in dynamo
const parseFiles = async (db, files, parameters) => {
  const urls = Object.keys(files)
  const opts = { urls, blockBucket: parameters.blockBucket }
  const resp = await executeParseFiles(opts, parameters)
  const writes = []
  for (const [url, parts] of Object.entries(resp)) {
    writes.push(saveFile.saveFile(db, url, parameters.bucket, parts, files[url]))
  }
  return Promise.all(writes)
}

module.exports = {
  parseFile,
  parseFiles,
  debug: saveFile.debug
}

