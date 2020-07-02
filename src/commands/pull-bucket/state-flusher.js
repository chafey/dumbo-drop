
const stateFile = require('./state-file')

let saveStateIntervalId

// starts the state flusher which will flush the processing
// state every <saveStateIntervalMS> so we can resume processing
// if it is interrupted (crash or user cancelled)
const start = async (appState, bucket, saveStateIntervalMS) => {
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
