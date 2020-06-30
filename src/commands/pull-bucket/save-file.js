const limits = require('../../limits')
const putItem = require('./serialized-put-item')

// saves the parsing results for a single file to dynamo.
const saveFile = async (db, url, dataset, parts, size) => {
  const item = { url, size, dataset, parts }
  return putItem(db, item)
}

const saveSplits = async (db, url, dataset, splits, size) => {
  /*
  DynamoDB has a 400K limit on the size of an entry. With
  the size of hash strings that means we can't store the
  parts of a file over 7GB.

  Since we're already breaking up the chunking of files
  over 1GB it makes sense to store the parts split by
  the same limit. This is all a bit of a hack, but it
  was going to be necessary to break up large files
  at some boundary point anyway in order to spread
  files over 32GB into multiple .car files later on.
  */
  let i = 0
  const originalSize = size

  const writes = []
  for (const parts of splits) {
    const _size = size
    size -= limits.MAX_CAR_FILE_SIZE
    const l = _size < limits.MAX_CAR_FILE_SIZE ? _size : limits.MAX_CAR_FILE_SIZE
    const item = { size: l, dataset, parts, url: `::split::${url}::${i}` }
    writes.push(putItem(db, item))
    i++
  }
  const writeResponses = await Promise.all(writes)
  const item = { url, size: originalSize, dataset, split: true }
  const resp = await putItem(db, item)
  const result = [resp, ...writeResponses] 
  return result
}

module.exports = {
    saveFile,
    saveSplits,
    debug : putItem.debug
}