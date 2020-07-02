
const { readFile } = require('fs').promises
const { writeFileSync } = require('fs')

const getPath = (settings) => {
  return `.state-${settings.bucket}`
}

const load = async (settings, read = readFile) => {
  try {
    const data = await read(getPath(settings))
    const state = JSON.parse(data)
    // TODO: Consider doing more validation of the state file here
    return state
  } catch (e) {
    console.log(e)
    return null
  }
}

const save = async (appState, settings, write = writeFileSync) => {
  console.log('writing state file...')
  const startAfter = appState.inflight.length ? appState.inflight[0] : appState.latest
  const _state = {
    completed: appState.display.processed + appState.display.skippedBytes,
    startAfter: startAfter
  }
  write(getPath(settings), Buffer.from(JSON.stringify(_state)))
}

module.exports = {
  load,
  save
}
