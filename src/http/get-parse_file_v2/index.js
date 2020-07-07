// learn more about HTTP functions here: https://arc.codes/primitives/http
const Block = require('@ipld/block')
const bent = require('bent')
const get = bent(200, 206)

const dumboDrop = require('dumbo-drop')
const createStore = dumboDrop.store
const chunkFile = dumboDrop.chunkFile
const limiter = dumboDrop.limiter

const parseFile = async (blockBucket, limit, url, headers, retries = 2) => {
  const store = createStore(Block, blockBucket)
  return chunkFile(store, get, limit, url, headers, retries)
}

exports.handler = async (req) => {
  console.log('get-parse_file_v2 req.query=', req.query)

  const blockBucket = req.query.blockBucket
  if (!blockBucket) throw new Error('Must pass blockBucket in options')
  const limit = limiter(100)
  if (req.query.url) {
    // URL for single file - parse it
    const cids = await parseFile(blockBucket, limit, req.query.url, req.query.headers)
    await limit.wait()
    return {
      headers: { 'content-type': 'application/json; charset=utf8' },
      body: JSON.stringify(cids.map(c => c.toString('base64')))
    }
  } else if (req.query.urls) {
    // urls for many files, parse each one in parallel
    const ret = {}
    for (const url of req.query.urls) {
      const cids = await parseFile(blockBucket, limit, url)
      ret[url] = cids.map(c => c.toString('base64'))
    }
    await limit.wait()
    // return parsing status
    return {
      headers: { 'content-type': 'application/json; charset=utf8' },
      body: JSON.stringify(ret)
    }
  }
  throw new Error('Must pass either url or urls in query')
}
