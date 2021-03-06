const Block = require('@ipld/block')
const importer = require('unixfsv1-part-importer')
const CarDatastore = require('datastore-car')
const CID = require('cids')

const createGetBlock = async (cacheBlocks, store) => {
  const cache = new Map()
  const cids = await Promise.all(cacheBlocks.map(b => b.cid()))
  for (const cid of cids) {
    cache.set(cid.toString('base32'), cacheBlocks.shift())
  }
  const getBlock = async cid => {
    const key = cid.toString('base32')
    if (cache.has(key)) return cache.get(key)
    return store.get(cid)
  }
  return getBlock
}

const onemeg = 1024 * 1024

const createPart = async (files, carFileBucket, store, s3stream) => {
  const ret = {}
  const urls = {}
  const roots = []
  const dagBlocks = []
  // iterate over each file/file slice pointer collecting the block cids
  // Then generate the root block referencing all collected block cids
  for (let [filename, [_parts, size]] of Object.entries(files)) {
    const parts = []
    for (const cid of _parts) {
      const _size = size < onemeg ? size : onemeg
      size = size - _size
      parts.push({ cidVersion: 1, cid: new CID(cid), size: _size })
    }
    urls[filename] = parts.map(x => x.cid)
    dagBlocks.push(...await importer(parts))
    const root = await dagBlocks[dagBlocks.length - 1].cid()
    roots.push(root)
    ret[filename] = [roots.length - 1, root.toString('base32')]
  }

  // The root of the car file is an ipld block with a list of cids contained
  // in this car file.
  const rootBlock = Block.encoder(roots, 'dag-cbor')
  dagBlocks.push(rootBlock)

  // store the graph to the car data strore
  const carRoot = await rootBlock.cid()
  const rootString = carRoot.toString('base32')
  const carFilename = `${rootString}/${rootString}.car`
  const getBlock = await createGetBlock(dagBlocks, store)
  const opts = {
    ACL: 'public-read',
    Bucket: carFileBucket,
    Key: carFilename
  }
  const upload = s3stream.upload(opts)
  const uploaded = new Promise(resolve => upload.once('uploaded', resolve))
  const writer = await CarDatastore.writeStream(upload)
  await CarDatastore.completeGraph(carRoot, getBlock, writer, 1000)

  const details = await uploaded

  return {
    details,
    results: ret,
    root: carRoot.toString('base32'),
    carFilename
  }
}

module.exports = createPart
