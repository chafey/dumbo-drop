const skipItems = require('./skip-items')
const parseFile = require('./parse-file')

// function to parse multiple files at once
const runBulk = async (db, _bulk, settings, appState) => {
  const files = {}
  const keyMap = {}
  _bulk = _bulk.map(info => {
    files[info.url] = info.Size
    keyMap[info.url] = info.Key
    return info
  })
  const found = await skipItems.skipItems(db, Object.keys(files), settings.checkHead, settings.force)
  for (const url of found) {
    appState.display.skippedBytes += files[url]
    delete files[url]
    appState.display.skipped += 1
  }

  const urls = Object.keys(files)
  if (urls.length) {
    urls.forEach(url => appState.inflight.push(keyMap[url]))
    const db = require('../../queries')(settings.tableName)
    await parseFile.files(db, settings.blockBucket, files, settings.bucket, settings.local)
    urls.forEach(url => appState.inflight.splice(appState.inflight.indexOf(keyMap[url]), 1))
    appState.display.complete += urls.length
    appState.display.processed += Object.values(files).reduce((x, y) => x + y, 0)
  }
}

module.exports = runBulk
