const saveFile = require('./save-file')
const executeParseFile = require('./execute-parse-file')

// parses a file by invoking the lambda function to read the file,
// chunk it into IPLD blocks, store those blocks in S3 and write
// the resulting info (including CIDs) into dynamo.
// If the file size exceeds a certain
// limit, then it is split into multiple pieces in dynamo to work around
// a data size limit in dynamo
const parseFile = async (db, blockBucket, url, dataset, size, local, limits) => {
  let opts = { url, blockBucket }
  let parts = []
  if (size < limits.MAX_CAR_FILE_SIZE) {
    parts = await executeParseFile.executeParseFile(opts, local)
    const resp = await saveFile.saveFile(db, url, dataset, parts, size)
    return resp
  } else {
    let i = 0
    const splits = []
    while (i < size) {
      opts = { url, headers: { Range: `bytes=${i}-${(i + limits.MAX_CAR_FILE_SIZE) - 1}` }, blockBucket }
      const chunks = await executeParseFile.executeParseFile(opts, local)
      splits.push(chunks)
      i += limits.MAX_CAR_FILE_SIZE
    }
    const resp = await saveFile.saveSplits(db, url, dataset, splits, size, limits)
    return resp
  }
}

// batch interface for parsing multiple small files into IPLD blocks stored in S3
// using a lambda function and saving resulting CIDs in dynamo
const parseFiles = async (db, blockBucket, files, dataset, local) => {
  const urls = Object.keys(files)
  const opts = { urls, blockBucket }
  const resp = await executeParseFile.executeParseFiles(opts, local)
  const writes = []
  for (const [url, parts] of Object.entries(resp)) {
    writes.push(saveFile.saveFile(db, url, dataset, parts, files[url]))
  }
  return Promise.all(writes)
}

module.exports = parseFile
module.exports.files = parseFiles
module.exports.debug = saveFile.debug

