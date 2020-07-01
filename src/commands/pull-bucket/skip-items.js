const bent = require('bent')
const defaultHead = bent('HEAD', 200, 403, 500 /* these are intermittent and retries tend to fix */)

// checks to see if a URL to an S3 file should be skipped (not processed).  It should be
// skipped if:
// 1) It was already processed and in the dynamodb
// 2) checkHead is true and S3 returns 403 which indicates it has wrong permission
const skipItem = async (db, url, checkHead = false, head = defaultHead) => {
  const item = await db.getItem(url, ['url'])
  if (item && item.url) return true
  if (!checkHead) return false
  const resp = await head(url)
  if (resp.statusCode === 403) return true
  return false
}

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

module.exports = {
  skipItem,
  skipItems
}
