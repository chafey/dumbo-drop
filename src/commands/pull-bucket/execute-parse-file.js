const lambda = require('../../lambda')()
const chunkFile = require('../../chunk-file')
const createStore = require('../../store')
const Block = require('@ipld/block')
const bent = require('bent')
const get = bent(200, 206)
const limiter = require('../../limiter')

const executeParseFile = async (opts, settings) => {
  if (settings.local) {
    const store = createStore(Block, opts.blockBucket)
    const limit = limiter(100)
    const cids = await chunkFile(store, get, limit, opts.url, opts.headers)
    return cids.map(c => c.toString('base64'))
  } else {
    return lambda(settings.parseFileLambda, opts)
  }
}

const executeParseFiles = async (opts, settings) => {
  if (settings.local) {
    const store = createStore(Block, opts.blockBucket)
    const limit = limiter(100)
    const ret = {}
    for (const url of opts.urls) {
      const cids = await chunkFile(store, get, limit, url, opts.headers)
      ret[url] = cids.map(c => c.toString('base64'))
    }
    await limit.wait()
    return ret
  } else {
    return lambda(settings.parseFileLambda, opts)
  }
}

module.exports = {
  executeParseFile,
  executeParseFiles
}
