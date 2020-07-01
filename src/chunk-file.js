const fixed = require('fixed-chunker')
const Block = require('@ipld/block')
const defaultLimits = require('./limits')

const chunkFile = async (store, get, limit, url, headers, retries = 2, limits = defaultLimits) => {
    let stream
    // get a read stream for this file
    try {
      stream = await get(url, null, headers)
    } catch (e) {
        // retry parsing if we get an HTTP 400 Error Code (BAD REQUEST)
      if (e.statusCode > 400) {
        if (!retries) {
          throw new Error(`Unacceptable error code: ${e.statusCode} for ${url}`)
        }
        return chunkFile(store, get, limit, url, null, retries - 1)
      } else {
        throw e
      }
    }
    const parts = []
    // chunk the file into 1MB buffers, encode them as IPLD blocks
    // and store in S3
    for await (const chunk of fixed(stream, limits.MAX_BLOCK_SIZE)) {
        const block = Block.encoder(chunk, 'raw')
        await limit(store.put(block))
        if (chunk.length) parts.push(block.cid())
    }
    return Promise.all(parts)
  }

  module.exports = chunkFile