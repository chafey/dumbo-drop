
let saveStateIntervalId
let state

const start = async (appState, settings) => {
  // if we have a state file, read it and resume processing from that point.  If no state
  // file initialize it to start a fresh run
  const stateFile = `.state-${settings.bucket}`
  const loadState = async () => {
    let f
    try {
      f = await readFile(stateFile)
    } catch (e) {
      return null
    }
    return JSON.parse(f.toString())
  }
  state = await loadState(stateFile)
  if (state && state.startAfter) {
    appState.display.skippedBytes = state.completed
  } else {
    state = { completed: 0 }
  }
  // setup a timer to periodically save our current processing state so we can resume
  // if something goes wrong
  const saveState = async () => {
    state.startAfter = appState.inflight.length ? appState.inflight[0] : appState.latest || state.startAfter
    const _state = {
      completed: appState.display.processed + appState.display.skippedBytes,
      startAfter: state.startAfter
    }
    return writeFileSync(stateFile, Buffer.from(JSON.stringify(_state)))
  }
  saveStateIntervalId = setInterval(async () => {
    await saveState()
  }, settings.internal.saveStateIntervalMS)

  return state.startAfter
}

const stop = () => {
  clearInterval(saveStateIntervalId)
}

module.exports = {
  start,
  stop
}
