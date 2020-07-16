const bent = require('bent')
const defaultHead = bent('HEAD', 200, 403, 500 /* these are intermittent and retries tend to fix */)

// returns a collection of URLs to S3 files that should be skipped.  An S3 file should
// be skipped if:
// 1) we have an entry in dynamodb for it and force is false
// 2) check head is true and a HTTP HEAD request for it returns 403
const skipItems = async (db, urls, checkHead = false, force = false, head = defaultHead) => {
  const found = force ? new Set() : new Set(Object.keys(await db.getItems(urls)))
  const missing = urls.filter(u => !found.has(u))
  const promises = []
  if (checkHead) {
    for (const url of missing) {
      promises.push(head(url).then(resp => {
        if (resp.statusCode === 403) found.add(url)
      }))
    }
  }
  await Promise.all(promises)
  return found
}

module.exports = skipItems
