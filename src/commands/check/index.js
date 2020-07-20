const listFiles = require('../pull-bucket/list-files')
const getUrl = require('../pull-bucket/get-url')
const bent = require('bent')
const get = bent(200, 206)
const queries = require('../../queries')

run = async (argv, parameters) => {
  const startAfter = undefined

  const db = queries(parameters.tableName)

  for await (let file of listFiles.ls(startAfter, parameters)) {
    //console.log('file=', file)
    const url = getUrl(file.Key, parameters.bucket)
    console.log('source file url,size = ', url, file.Size)

    // verify accessibility of file by reading from it
    try {
      const sourceFileStream = await get(url)
      const item = await db.getItem(url, ['url', 'parts', 'carUrl', 'size', 'root'])
      if (!item) {
        console.error('File not in db', url)
      }
    }
    catch (err) {
      console.error("Unable to access file", url)
    }
  }
}


module.exports = run
