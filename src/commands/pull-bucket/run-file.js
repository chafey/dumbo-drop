const skipItems = require('./skip-items')
const parseFile = require('./parse-file')

// Function to parse a single file
const runFile = async (db, info, limits, settings, appState) => {
  const tableName = `dumbo-v2-${settings.bucket}`
  const blockBucket = process.env.DUMBO_BLOCK_STORE
  if (info.Size) {
    if (settings.force || !(await skipItems.skipItem(db, info.url, settings.checkHead))) {
      appState.inflight.push(info.Key)
      const db = require('../../queries')(tableName)
      await parseFile(db, blockBucket, info.url, info.Bucket, info.Size, settings.local, limits)
      appState.display.complete += 1
      appState.inflight.splice(appState.inflight.indexOf(info.Key), 1)
      appState.display.processed += info.Size
    } else {
      appState.display.skippedBytes += info.Size
      appState.display.skipped += 1
    }
  }
}

module.exports = runFile
