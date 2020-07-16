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
  if (!req.query.urls) throw new Error('Must pass either url or urls in query')

  const limit = limiter(100)

  // we only use headers for single files
  const headers = (req.query.urls.length === 1) ? req.query.headers : undefined

  // iterate through each file getting the resulting block cids
  const ret = {}
  for (const url of req.query.urls) {
    const cids = await parseFile(blockBucket, limit, url, headers)
    ret[url] = cids.map(c => c.toString('base64'))
  }

  await limit.wait()

  return {
    headers: { 'content-type': 'application/json; charset=utf8' },
    body: JSON.stringify(ret)
  }
}
