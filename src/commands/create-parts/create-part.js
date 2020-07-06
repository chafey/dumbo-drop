const executeCreateParts = require('./execute-create-parts')

let updateMutex = null

// creates a car file from a list of files or file slices
const createPart = async (db, urls, size, output, parameters) => {
  output.inflight++
  const files = await db.getItems(urls, 'parts', 'size')
  for (const [f, item] of Object.entries(files)) {
    files[f] = [item.parts, item.size]
  }

  const query = { Bucket: parameters.carFileBucket, files, blockBucket: parameters.blockBucket }
  const resp = await executeCreateParts(query, parameters.local)
  const { results, details, root } = resp
  const carUrl = details.Location
  const updates = []
  for (const [key, _root] of Object.entries(results)) {
    updates.push({ key, root: [root, ..._root], carUrl })
  }
  output.updateQueue++
  while (updateMutex) {
    await updateMutex
  }
  output.updateQueue--
  updateMutex = db.bulkUpdate(updates)
  await updateMutex
  updateMutex = null
  output.completed++
  output.completedBytes += size

  output.inflight--
}

module.exports = createPart
