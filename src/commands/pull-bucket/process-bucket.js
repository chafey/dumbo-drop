const limiter = require('../../limiter')
const runBulk = require('./run-bulk')
const listFiles = require('./list-files')
const runFile = require('./run-file')
const getURL = require('./get-url')
const limits = require('../../limits')

const sleep = ts => new Promise(resolve => setTimeout(resolve, ts))

// get list of files from bucket and parse them through the limiter
const processBucket = async (startAfter, appState, settings) => {
  // TODO: check for table and create if missing
  const tableName = `dumbo-v2-${settings.bucket}`
  const db = require('../../queries')(tableName)
  let bulk = []

  const limit = limiter(settings.concurrency)
  const bulkLength = () => bulk.reduce((x, y) => x + y.Size, 0)

  for await (let fileInfo of listFiles.ls(settings, startAfter)) {
    if (!fileInfo.Size) continue
    fileInfo = { ...fileInfo }

    fileInfo.url = getURL(fileInfo.Key, settings.bucket)
    appState.latest = fileInfo.Key

    // Bulking is fixes to either 1GB (to avoid Lambda timeout)
    // or to 100 entries since that is the batchGetItem limit anyway.
    // I ran a small test w/ 500 in the bulk set and parallel getItem
    // requests but it didn't make any difference.

    if (fileInfo.Size > limits.MAX_CAR_FILE_SIZE) {
      await limit(runFile(db, fileInfo, limits, settings, appState))
      await sleep(500)
      continue
    } else if (((bulkLength() + fileInfo.Size) > limits.MAX_CAR_FILE_SIZE) || bulk.length > 99) {
      await limit(runBulk(db, bulk, settings, appState))
      await sleep(500)
      bulk = []
    }
    bulk.push(fileInfo)
  }
  await limit(runBulk(db, bulk, settings, appState))
  await limit.wait()
}

module.exports = processBucket
