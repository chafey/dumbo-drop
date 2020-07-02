const { readFile } = require('fs').promises
const { writeFileSync } = require('fs')

const getPath = (bucket) => {
  return `.state-${bucket}`
}

// loads the processing state file from a previous processing run for <bucket> or
// null if there is no state file
const load = async (bucket, read = readFile) => {
  try {
    const data = await read(getPath(bucket))
    const state = JSON.parse(data)
    // TODO: Consider doing more validation of the state file here
    return state
  } catch (e) {
    return null
  }
}

// saves the current processing state for the specified bucket
const save = async (appState, bucket, write = writeFileSync) => {
  const startAfter = appState.inflight.length ? appState.inflight[0] : appState.latest
  const _state = {
    completed: appState.display.processed + appState.display.skippedBytes,
    startAfter: startAfter
  }
  write(getPath(bucket), Buffer.from(JSON.stringify(_state)))
}

module.exports = {
  load,
  save
}
