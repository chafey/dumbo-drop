const skipItems = require('./skip-items')
const parseFile = require('./parse-file')

// function to parse multiple files at once
const runBulk = async (db, _bulk, appState, parameters) => {
  const files = {}
  const keyMap = {}
  _bulk = _bulk.map(info => {
    files[info.url] = info.Size
    keyMap[info.url] = info.Key
    return info
  })
  const found = await skipItems(db, Object.keys(files), parameters.checkHead, parameters.force)
  for (const url of found) {
    appState.display.skippedBytes += files[url]
    delete files[url]
    appState.display.skippedFiles += 1
  }

  const urls = Object.keys(files)
  if (urls.length) {
    urls.forEach(url => appState.inflight.push(keyMap[url]))
    await parseFile.parseFiles(db, files, parameters)
    urls.forEach(url => appState.inflight.splice(appState.inflight.indexOf(keyMap[url]), 1))
    appState.display.processedFiles += urls.length
    appState.display.processedBytes += Object.values(files).reduce((x, y) => x + y, 0)
  }
}

module.exports = runBulk
