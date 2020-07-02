const skipItems = require('./skip-items')
const parseFile = require('./parse-file')

// function to parse multiple files at once
const runBulk = async (db, _bulk, checkHead, force, display, inflight, opts, local) => {
  const blockBucket = process.env.DUMBO_BLOCK_STORE
  const files = {}
  const keyMap = {}
  _bulk = _bulk.map(info => {
    files[info.url] = info.Size
    keyMap[info.url] = info.Key
    return info
  })
  const found = await skipItems.skipItems(db, Object.keys(files), checkHead, force)
  for (const url of found) {
    display.skippedBytes += files[url]
    delete files[url]
    display.skipped += 1
  }

  const urls = Object.keys(files)
  if (urls.length) {
    urls.forEach(url => inflight.push(keyMap[url]))
    const tableName = `dumbo-v2-${opts.Bucket}`
    const db = require('../../queries')(tableName)
    await parseFile.files(db, blockBucket, files, opts.Bucket, local)
    urls.forEach(url => inflight.splice(inflight.indexOf(keyMap[url]), 1))
    display.complete += urls.length
    display.processed += Object.values(files).reduce((x, y) => x + y, 0)
  }
}

module.exports = runBulk
