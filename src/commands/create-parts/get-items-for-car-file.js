const limits = require('../../limits')

// array of objects which contain a total size and list of file part/slices
// that add up to that size.  This is used to collect file parts/slices together
// to generate car files near the max car file size
const allocations = []

// get list of files to turn into car parts
const ls = db => {
  const attrs = ['carUrl', 'size', 'url', 'split']
  const params = db.mkquery(attrs, { true: true })
  params.FilterExpression = 'not #split = :true and attribute_not_exists(#carUrl)'
  params.ProjectionExpression = attrs.map(s => '#' + s).join(', ')
  return db.slowScan(params)
}

// iterator function that returns an array of files or file slices
// to be aggregated together into a single car file.
const getItemsForCARFile = async function* (db) {
  for await (const { url, size } of ls(db)) {
    if (size > limits.MAX_CAR_FILE_SIZE) throw new Error('Part slice too large')
    // for files or file slices of carfile maxsize, encode it into a single car file
    if (size === limits.MAX_CAR_FILE_SIZE) {
      yield [size, [url]]
      continue
    }
    let allocated = false
    // iterate through all existing allocation entries and add this file or file part
    // to an existing entry as long as it doesn't exceed the max car file size.  Also
    // return all files/file parts if we meet the criteria to generate a complete car file
    for (let i = 0; i < allocations.length; i++) {
      const [_size, _urls] = allocations[i]
      const csize = _size + size
      // if adding this file part/slice does not exceed max car file size..
      if (csize < limits.MAX_CAR_FILE_SIZE) {
        // merge this file part/slice into the allocation entry
        const entryUrls = [..._urls, url]
        const entry = [csize, entryUrls]

        // check to see if we should create a car file now
        if ((csize > (limits.MAX_CAR_FILE_SIZE - (limits.MAX_BLOCK_SIZE))) || entryUrls.length > limits.MAX_CAR_FILES) {
          // yes - remove the accumulated entries and return them
          allocations.splice(i, 1)
          yield entry
        } else {
          // no - replace the allocated entry with this new aggregated one.
          allocations[i] = entry
        }
        // file part/slice has been allocated, break out of loop
        allocated = true
        break
      }
    }
    if (!allocated) allocations.push([size, [url]])
  }
  // iteration complete, return the list of file parts/slices
  // to be encoded into the last car file
  yield* allocations
}

module.exports = getItemsForCARFile
