const bent = require('bent')
const head = bent('HEAD', 200, 403, 500 /* these are intermittent and retries tend to fix */)

const skipItem = async (db, url, checkHead = false) => {
    const item = await db.getItem(url, ['url'])
    if (item && item.url) return true
    if (!checkHead) return false
    const resp = await head(url)
    if (resp.statusCode === 403) return true
    return false
  }
  
  const skipItems = async (db, urls, checkHead = false, force = false) => {
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