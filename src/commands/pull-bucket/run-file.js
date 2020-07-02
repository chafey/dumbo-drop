const skipItems = require('./skip-items')
const parseFile = require('./parse-file')

// Function to parse a single file
const runFile = async (db, info, limits, settings, appState) => {
  if (info.Size) {
    if (settings.force || !(await skipItems.skipItem(db, info.url, settings.checkHead))) {
      appState.inflight.push(info.Key)
      // TODO: Check with @mikeal to see if we can re-use the db passed in, or if we must
      // create a new one
      const db = require('../../queries')(settings.tableName)
      await parseFile(db, settings.blockBucket, info.url, settings.bucket, info.Size, settings.local, limits)
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
