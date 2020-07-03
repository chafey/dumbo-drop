
const stateFile = require('./state-file')

let saveStateIntervalId

const TEN_SECONDS_IN_MS = 10000

// starts the state flusher which will flush the processing
// state every <saveStateIntervalMS> so we can resume processing
// if it is interrupted (crash or user cancelled)
const start = async (appState, bucket, saveStateIntervalMS = TEN_SECONDS_IN_MS) => {
  stateFile.save(appState, bucket)

  saveStateIntervalId = setInterval(async () => {
    await stateFile.save(appState, bucket)
  }, saveStateIntervalMS)
}

// stops the state flusher
const stop = () => {
  clearInterval(saveStateIntervalId)
}

module.exports = {
  start,
  stop
}
