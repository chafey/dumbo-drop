// Function to parse a single file
const runFile = async (info, checkHead, force, local, limits, opts, display, inflight) => {
  const tableName = `dumbo-v2-${opts.Bucket}`
  if (info.Size) {
    if (force || !(await skipItems.skipItem(db, info.url, checkHead))) {
      inflight.push(info.Key)
      const db = require('../../queries')(tableName)
      await parseFile(db, blockBucket, info.url, info.Bucket, info.Size, local, limits)
      display.complete += 1
      inflight.splice(inflight.indexOf(info.Key), 1)
      display.processed += info.Size
    } else {
      display.skippedBytes += info.Size
      display.skipped += 1
    }
  }
}

module.exports = runFile
