
let saveStateIntervalId
let state

const start = async (Bucket, display, inflight, latest) => {
  // if we have a state file, read it and resume processing from that point.  If no state
  // file initialize it to start a fresh run
  const stateFile = `.state-${Bucket}`
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
    opts.StartAfter = state.startAfter
    display.skippedBytes = state.completed
  } else {
    state = { completed: 0 }
  }
  // setup a timer to periodically save our current processing state so we can resume
  // if something goes wrong
  const saveState = async () => {
    state.startAfter = inflight.length ? inflight[0] : latest || state.startAfter
    const _state = {
      completed: display.processed + display.skippedBytes,
      startAfter: state.startAfter
    }
    return writeFileSync(stateFile, Buffer.from(JSON.stringify(_state)))
  }
  saveStateIntervalId = setInterval(async () => {
    await saveState()
  }, 10000)
}


const stop = () => {
  clearInterval(saveStateIntervalId)
}

module.exports = {
  start,
  stop
}
