const listFiles = require('../pull-bucket/list-files')
const getUrl = require('../pull-bucket/get-url')
const bent = require('bent')
const get = bent(200, 206)
const queries = require('../../queries')
const limiter = require('../../limiter')
const AWS = require('aws-sdk')

const sleep = ts => new Promise(resolve => setTimeout(resolve, ts))

const getUrlLocal = (key, parameters) => {
  if (parameters.useOldUrls) {
    return `https://${parameters.bucket}.s3.amazonaws.com/${AWS.util.uriEscapePath(key)}`
  } else {
    return getUrl(key, parameters.bucket)
  }
}

const checkFileAccess = async (url) => {
  const MAX_ATTEMPTS = 5
  let attempt = 0
  let error
  while (++attempt <= MAX_ATTEMPTS) {
    try {
      const sourceFileStream = await get(url)
      return true
    }
    catch (err) {
      error = err
      console.log(`${err.errno} ${attempt}/${MAX_ATTEMPTS} ${url}`)
      await sleep(1000)
    }
  }
  console.error(`${error} ${url}`)
  return false
}

const checkFile = async (db, url) => {
  // verify accessibility of file by reading from it
  if (await checkFileAccess(url)) {
    const item = await db.getItem(url, ['url', 'parts', 'carUrl', 'size', 'root'])
    if (!item) {
      console.error('File not in db', url)
    }
  }
}

run = async (argv, parameters) => {
  const startAfter = undefined

  const db = queries(parameters.tableName)

  let fileCount = 0

  const limit = limiter(parameters.concurrency)

  for await (let file of listFiles.ls(startAfter, parameters)) {
    const url = getUrlLocal(file.Key, parameters)
    console.log(`#${fileCount++} ${url} ${file.Size}`)
    await limit(checkFile(db, url))
  }
}


module.exports = run
