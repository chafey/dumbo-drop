const skipItems = require('./skip-items')
const parseFile = require('./parse-file')

// Function to parse a single file
const runFile = async (db, info, appState, parameters, limits) => {
  if (info.Size) {
    if (parameters.force || !(await skipItems.skipItem(db, info.url, parameters.checkHead))) {
      appState.inflight.push(info.Key)
      await parseFile.parseFile(db, info.url, info.Size, limits, parameters)
      appState.display.processedFiles += 1
      appState.inflight.splice(appState.inflight.indexOf(info.Key), 1)
      appState.display.processedBytes += info.Size
    } else {
      appState.display.skippedBytes += info.Size
      appState.display.skippedFiles += 1
    }
  }
}

module.exports = runFile
