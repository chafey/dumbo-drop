const AWS = require('../../aws')
const awsConfig = require('aws-config')
const limiter = require('../../limiter')
const s3 = new AWS.S3({ ...awsConfig(), correctCloseSkew: true })
const progress = require('./progress')
const createPart = require('./create-part')
const getItemsForCARFile = require('./get-items-for-car-file')

const output = { completed: 0, completedBytes: 0, inflight: 0, updateQueue: 0, largest: 0 }

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// entry point for file
const run = async (argv, parameters) => {

  console.log(parameters)

  // setup interval to print out progress/status
  if (!argv.silent) {
    //progress.start(output)
  }

  // create bucket for cars
  try {
    await s3.createBucket({ Bucket: parameters.carFileBucket, ACL: 'public-read' }).promise()
  } catch (e) { /* noop */ }

  const db = require('../../queries')(parameters.tableName)

  const limit = limiter(parameters.concurrency)

  // get list of urls to files or file slices to process and create cars from them
  // using the limiter
  for await (const [size, urls] of getItemsForCARFile(db, parameters.bucket)) {
    if (urls.length > output.largest) output.largest = urls.length
    await limit(createPart(db, urls, size, output, parameters))
    await sleep(50) // protect against max per second request limits
  }
  await limit.wait()
  progress.stop(output)
}
module.exports = run
module.exports.getItemsForCARFile = getItemsForCARFile
