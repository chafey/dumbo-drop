
let writeMutex

const debug = { pending: 0, free: 0 }

// serialized put item - ensures that at most one putItem() is being
// run at a time to dynamodDb.  This is needed because it starts failing
// under too many concurrent writes
const serializedPutItem = async (db, item) => {
  debug.pending++
  while (writeMutex) {
    await writeMutex
  }
  writeMutex = db.putItem(item)
  const promise = writeMutex
  writeMutex.catch(() => {
    // NOTE: rejection is passed up to caller...
  }).finally(() => {
    writeMutex = null
    debug.free++
    debug.pending--
  })
  return promise
}

module.exports = serializedPutItem
module.exports.debug = debug
