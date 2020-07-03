const limiter = require('../../limiter')
const runBulk = require('./run-bulk')
const listFiles = require('./list-files')
const runFile = require('./run-file')
const getURL = require('./get-url')
const limits = require('../../limits')

const sleep = ts => new Promise(resolve => setTimeout(resolve, ts))

const HALF_SECOND_IN_MS = 500
const MAX_FILES_PER_BATCH = 99

// get list of files from bucket and parse them through the limiter
const processBucket = async (startAfter, appState, parameters) => {
  const db = require('../../queries')(parameters.tableName)
  let bulk = []

  const limit = limiter(parameters.concurrency)
  const bulkLength = () => bulk.reduce((x, y) => x + y.Size, 0)

  for await (let fileInfo of listFiles.ls(startAfter, parameters)) {
    if (!fileInfo.Size) continue
    fileInfo = { ...fileInfo }

    fileInfo.url = getURL(fileInfo.Key, parameters.bucket)
    appState.latest = fileInfo.Key

    // Bulking is fixes to either 1GB (to avoid Lambda timeout)
    // or to 100 entries since that is the batchGetItem limit anyway.
    // I ran a small test w/ 500 in the bulk set and parallel getItem
    // requests but it didn't make any difference.

    if (fileInfo.Size > limits.MAX_CAR_FILE_SIZE) {
      await limit(runFile(db, fileInfo, appState, parameters, limits))
      await sleep(HALF_SECOND_IN_MS)
      continue
    } else if (((bulkLength() + fileInfo.Size) > limits.MAX_CAR_FILE_SIZE) || bulk.length > MAX_FILES_PER_BATCH) {
      await limit(runBulk(db, bulk, appState, parameters))
      await sleep(HALF_SECOND_IN_MS)
      bulk = []
    }
    bulk.push(fileInfo)
  }
  await limit(runBulk(db, bulk, appState, parameters))
  await limit.wait()
}

module.exports = processBucket
