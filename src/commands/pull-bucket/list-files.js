const AWS = require('aws-sdk')
const awsConfig = require('aws-config')

// returns list of files in bucket
const ls = async function * (opts, s3 = new AWS.S3({ ...awsConfig(), correctCloseSkew: true })) {
    opts = { ...opts }
    let data
    do {
      data = await s3.listObjectsV2(opts).promise()
      yield * data.Contents
      if (!data.Contents.length) {
        return
      }
      opts.StartAfter = data.Contents[data.Contents.length - 1].Key
    } while (data.Contents.length)
  }
  
module.exports = {ls}  