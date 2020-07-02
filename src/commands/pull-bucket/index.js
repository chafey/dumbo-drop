const limiter = require('../../limiter')
const listFiles = require('./list-files')
const limits = require('../../limits')
const runBulk = require('./run-bulk')
const progress = require('./progress')
const stateFlusher = require('./state-flusher')
const runFile = require('./run-file')
const getURL = require('./get-url')

const sleep = ts => new Promise(resolve => setTimeout(resolve, ts))

// main entrypoint for parsing a bucket
const run = async (settings) => {
  const Bucket = settings.bucket
  const Prefix = settings.prefix
  const StartAfter = settings.startAfter

  const opts = {
    Bucket,
    Prefix,
    StartAfter
  }
  const limit = limiter(settings.concurrency)

  const appState = {
    // the most recent S3 url we are parseing.  This is written out to the state
    // file so we can continue from this point in case the app crashes
    latest: undefined,
    // list of S3 URLs currently being parsed/chunked
    inflight: [],

    display: { Bucket, skipped: 0, skippedBytes: 0, complete: 0, processed: 0 }
  }

  const display = appState.display
  const inflight = appState.inflight

  await stateFlusher.start(Bucket, appState)
  if (StartAfter) StartAfter = StartAfter.slice(0, StartAfter.length - 2)

  // TODO: check for table and create if missing
  const tableName = `dumbo-v2-${Bucket}`

  const db = require('../../queries')(tableName)

  // start out progress display
  progress.start(appState)

  let bulk = []
  const bulkLength = () => bulk.reduce((x, y) => x + y.Size, 0)

  // get list of files from bucket and parse them through the limiter
  for await (let fileInfo of listFiles.ls(opts)) {
    if (!fileInfo.Size) continue
    fileInfo = { ...fileInfo, ...opts }

    fileInfo.url = getURL(fileInfo)
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
  progress.stop()
  stateFlusher.stop()
  return display
}

module.exports = run
module.exports.getURL = getURL
