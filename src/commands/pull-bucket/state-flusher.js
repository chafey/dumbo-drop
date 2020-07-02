
const stateFile = require('./state-file')

let saveStateIntervalId

const start = async (appState, settings) => {
  saveStateIntervalId = setInterval(async () => {
    await stateFile.save(appState, settings)
  }, settings.internal.saveStateIntervalMS)
}

const stop = () => {
  clearInterval(saveStateIntervalId)
}

module.exports = {
  start,
  stop
}
