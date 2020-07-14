const listFiles = require('../pull-bucket/list-files')
const queries = require('../../queries')
const getURL = require('../pull-bucket/get-url')
const limits = require('../../limits')

const listFileParts = async function* (startAfter, parameters) {
  const db = queries(parameters.tableName)

  for await (let fileInfo of listFiles.ls(startAfter, parameters)) {
    // get information about each file
    const url = getURL(fileInfo.Key, parameters.bucket)

    const item = await db.getItem(url, ['url', 'parts', 'split', 'carUrl', 'size'])
    if (item.split) {
      const numSplits = item.size / limits.MAX_CAR_FILE_SIZE
      const carFiles = []
      for (i = 0; i < numSplits; i++) {
        const splitUrl = `::split::${url}::${i}`
        const item = await db.getItem(splitUrl, ['url', 'parts', 'carUrl', 'size'])
        carFiles.push({
          url: item.carUrl,
          parts: item.parts
        })
      }
      yield {
        url,
        size: item.size,
        carFiles
      }
    } else {
      const fileParts = {
        url,
        size: item.size,
        carFiles: [{
          url: item.carUrl,
          parts: item.parts
        }]
      }
      yield fileParts
    }
  }
}

module.exports = listFileParts
